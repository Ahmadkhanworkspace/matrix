const mysql = require('mysql2/promise');
const db = require('../config/database');

class MatrixService {
  constructor() {
    this.paymentService = require('./PaymentService');
  }

  // Initialize matrix processing
  async processMatrixQueue() {
    try {
      console.log('Starting matrix queue processing...');
      
      // Get pending verifier entries
      const pendingEntries = await this.getPendingEntries();
      
      for (const entry of pendingEntries) {
        await this.processMatrixEntry(entry);
      }
      
      console.log(`Processed ${pendingEntries.length} matrix entries`);
    } catch (error) {
      console.error('Matrix processing error:', error);
      throw error;
    }
  }

  // Get pending matrix entries
  async getPendingEntries() {
    const [rows] = await db.execute(
      'SELECT * FROM verifier WHERE processed = 0 ORDER BY Date ASC'
    );
    return rows;
  }

  // Process individual matrix entry
  async processMatrixEntry(entry) {
    const { Username, mid, etype, Sponsor } = entry;
    
    try {
      // 1. Assign matrix position
      const positionId = await this.assignMatrixPosition(Username, mid, Sponsor);
      
      // 2. Process referral bonus
      await this.processReferralBonus(Username, Sponsor, mid, etype);
      
      // 3. Calculate and distribute commissions
      await this.distributeCommissions(positionId, mid);
      
      // 4. Check for cycle completion
      await this.checkCycleCompletion(positionId, mid);
      
      // 5. Mark as processed
      await this.markEntryProcessed(entry.ID);
      
      console.log(`Processed matrix entry for ${Username} in matrix ${mid}`);
    } catch (error) {
      console.error(`Error processing matrix entry for ${Username}:`, error);
      throw error;
    }
  }

  // Assign user to matrix position
  async assignMatrixPosition(username, matrixId, sponsor) {
    const matrixTable = `matrix${matrixId}`;
    
    // Get matrix configuration
    const [config] = await db.execute(
      'SELECT * FROM membershiplevels WHERE ID = ?',
      [matrixId]
    );
    
    if (!config[0]) {
      throw new Error(`Matrix configuration not found for ID ${matrixId}`);
    }
    
    const matrixConfig = config[0];
    
    // Find available position using spillover logic
    const position = await this.findAvailablePosition(matrixTable, matrixConfig);
    
    // Insert matrix position
    const [result] = await db.execute(
      `INSERT INTO ${matrixTable} (Username, Sponsor, ref_by, Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Level9, Level10, Leader, Total, Date, MainID, CDate) 
       VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, 0, NOW(), ?, NOW())`,
      [username, sponsor, position.upline, position.upline, position.mainId]
    );
    
    // Update user status and credits
    await this.updateUserCredits(username, matrixConfig);
    
    return result.insertId;
  }

  // Find available position using spillover logic
  async findAvailablePosition(matrixTable, config) {
    const { forcedmatrix, levels } = config;
    
    // Get all positions in the matrix
    const [positions] = await db.execute(`SELECT * FROM ${matrixTable} ORDER BY ID ASC`);
    
    if (positions.length === 0) {
      // First position in matrix
      return { upline: 0, mainId: 1 };
    }
    
    // Find position with available slots
    for (const position of positions) {
      const children = await this.getChildrenCount(matrixTable, position.ID);
      
      if (children < forcedmatrix) {
        return { upline: position.ID, mainId: position.MainID };
      }
    }
    
    // If no direct slots available, find spillover position
    return await this.findSpilloverPosition(matrixTable, positions, forcedmatrix);
  }

  // Get children count for a position
  async getChildrenCount(matrixTable, positionId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM ${matrixTable} WHERE ref_by = ?`,
      [positionId]
    );
    return rows[0].count;
  }

  // Find spillover position
  async findSpilloverPosition(matrixTable, positions, forcedmatrix) {
    // Find the first position that has available slots
    for (const position of positions) {
      const children = await this.getChildrenCount(matrixTable, position.ID);
      
      if (children < forcedmatrix) {
        return { upline: position.ID, mainId: position.MainID };
      }
    }
    
    // If still no position found, create new level
    const lastPosition = positions[positions.length - 1];
    return { upline: lastPosition.ID, mainId: lastPosition.MainID };
  }

  // Process referral bonus
  async processReferralBonus(username, sponsor, matrixId, entryType) {
    if (!sponsor) return;
    
    // Get matrix configuration
    const [config] = await db.execute(
      'SELECT refbonus, refbonuspaid FROM membershiplevels WHERE ID = ?',
      [matrixId]
    );
    
    if (!config[0] || config[0].refbonus <= 0) return;
    
    const { refbonus, refbonuspaid } = config[0];
    
    // Get sponsor info
    const [sponsorInfo] = await db.execute(
      'SELECT * FROM users WHERE Username = ?',
      [sponsor]
    );
    
    if (!sponsorInfo[0]) return;
    
    const sponsorData = sponsorInfo[0];
    
    // Check if sponsor is eligible for bonus
    if (sponsorData.status < 2) return; // Only pro members get referral bonus
    
    // Check if bonus should be paid
    if (entryType === 1 && refbonuspaid !== 2) return; // Re-entry and not configured for re-entry bonus
    
    // Calculate bonus amounts
    const totalBonus = refbonus;
    const reservePercentage = 10; // 10% reserve
    const reserveAmount = totalBonus * (reservePercentage / 100);
    const immediateAmount = totalBonus - reserveAmount;
    
    // Update sponsor's balance
    await db.execute(
      `UPDATE users SET 
       Total = Total + ?, 
       Unpaid = Unpaid + ?, 
       RRUnpaid = RRUnpaid + ? 
       WHERE Username = ?`,
      [totalBonus, immediateAmount, reserveAmount, sponsor]
    );
    
    // Log the transaction
    await db.execute(
      `INSERT INTO tlogs (Username, memid, matrix, Amount, purpose, Date) 
       VALUES (?, ?, ?, ?, 'Referral Bonus', NOW())`,
      [sponsor, 0, matrixId, totalBonus]
    );
    
    // Process automatic payout if configured
    if (sponsorData.TronWallet) {
      await this.paymentService.processAutomaticPayout(sponsor, immediateAmount);
    }
  }

  // Distribute commissions to upline
  async distributeCommissions(positionId, matrixId) {
    const matrixTable = `matrix${matrixId}`;
    
    // Get matrix configuration
    const [config] = await db.execute(
      'SELECT * FROM membershiplevels WHERE ID = ?',
      [matrixId]
    );
    
    if (!config[0]) return;
    
    const matrixConfig = config[0];
    
    // Get upline positions
    const upline = await this.getUplinePositions(matrixTable, positionId);
    
    // Distribute level commissions
    for (let level = 1; level <= 10; level++) {
      if (upline[level - 1] && matrixConfig[`Level${level}`] > 0) {
        await this.distributeLevelCommission(
          upline[level - 1], 
          matrixConfig[`Level${level}`], 
          matrixId, 
          level
        );
      }
    }
  }

  // Get upline positions
  async getUplinePositions(matrixTable, positionId) {
    const upline = [];
    let currentPosition = positionId;
    
    for (let level = 1; level <= 10; level++) {
      const [position] = await db.execute(
        `SELECT * FROM ${matrixTable} WHERE ID = ?`,
        [currentPosition]
      );
      
      if (!position[0]) break;
      
      currentPosition = position[0].ref_by;
      if (currentPosition === 0) break;
      
      upline.push(position[0]);
    }
    
    return upline;
  }

  // Distribute level commission
  async distributeLevelCommission(position, amount, matrixId, level) {
    const username = position.Username;
    
    // Update user balance
    await db.execute(
      `UPDATE users SET 
       Total = Total + ?, 
       Unpaid = Unpaid + ? 
       WHERE Username = ?`,
      [amount, amount, username]
    );
    
    // Log the transaction
    await db.execute(
      `INSERT INTO tlogs (Username, memid, matrix, Amount, purpose, Date) 
       VALUES (?, ?, ?, ?, 'Level ${level} Commission', NOW())`,
      [username, position.ID, matrixId, amount]
    );
    
    // Update matrix position
    await db.execute(
      `UPDATE matrix${matrixId} SET Total = Total + ? WHERE ID = ?`,
      [amount, position.ID]
    );
  }

  // Check for cycle completion
  async checkCycleCompletion(positionId, matrixId) {
    const matrixTable = `matrix${matrixId}`;
    
    // Get matrix configuration
    const [config] = await db.execute(
      'SELECT * FROM membershiplevels WHERE ID = ?',
      [matrixId]
    );
    
    if (!config[0]) return;
    
    const matrixConfig = config[0];
    const requiredPositions = Math.pow(matrixConfig.forcedmatrix, matrixConfig.levels);
    
    // Check if position has completed cycle
    const [position] = await db.execute(
      `SELECT * FROM ${matrixTable} WHERE ID = ?`,
      [positionId]
    );
    
    if (!position[0]) return;
    
    const totalChildren = await this.getTotalChildren(matrixTable, positionId, matrixConfig.levels);
    
    if (totalChildren >= requiredPositions) {
      await this.processCycleCompletion(position[0], matrixConfig);
    }
  }

  // Get total children count
  async getTotalChildren(matrixTable, positionId, levels) {
    let total = 0;
    let currentLevel = [positionId];
    
    for (let level = 1; level <= levels; level++) {
      const nextLevel = [];
      
      for (const posId of currentLevel) {
        const [children] = await db.execute(
          `SELECT ID FROM ${matrixTable} WHERE ref_by = ?`,
          [posId]
        );
        
        nextLevel.push(...children.map(child => child.ID));
        total += children.length;
      }
      
      currentLevel = nextLevel;
      if (currentLevel.length === 0) break;
    }
    
    return total;
  }

  // Process cycle completion
  async processCycleCompletion(position, matrixConfig) {
    const { matrixbonus, matchingbonus } = matrixConfig;
    
    // Award cycle completion bonus
    if (matrixbonus > 0) {
      await db.execute(
        `UPDATE users SET 
         Total = Total + ?, 
         Unpaid = Unpaid + ? 
         WHERE Username = ?`,
        [matrixbonus, matrixbonus, position.Username]
      );
      
      await db.execute(
        `INSERT INTO tlogs (Username, memid, matrix, Amount, purpose, Date) 
         VALUES (?, ?, ?, ?, 'Cycle Completion Bonus', NOW())`,
        [position.Username, position.ID, 1, matrixbonus]
      );
    }
    
    // Process matching bonus for sponsor
    if (matchingbonus > 0 && position.Sponsor) {
      await db.execute(
        `UPDATE users SET 
         Total = Total + ?, 
         Unpaid = Unpaid + ? 
         WHERE Username = ?`,
        [matchingbonus, matchingbonus, position.Sponsor]
      );
      
      await db.execute(
        `INSERT INTO tlogs (Username, memid, matrix, Amount, purpose, Date) 
         VALUES (?, ?, ?, ?, 'Matching Bonus', NOW())`,
        [position.Sponsor, position.ID, 1, matchingbonus]
      );
    }
    
    // Mark cycle as completed
    await db.execute(
      `UPDATE matrix1 SET CDate = NOW() WHERE ID = ?`,
      [position.ID]
    );
    
    // Send email notifications
    await this.sendCycleCompletionEmails(position, matrixConfig);
  }

  // Send cycle completion emails
  async sendCycleCompletionEmails(position, matrixConfig) {
    const emailService = require('./EmailService');
    
    // Send to cycle completer
    if (matrixConfig.cyclemail) {
      await emailService.sendEmail(
        position.Username,
        matrixConfig.Subject2 || 'Cycle Completed!',
        matrixConfig.Message2 || 'Congratulations! You have completed a matrix cycle.',
        matrixConfig.eformat2 || 2
      );
    }
    
    // Send to sponsor
    if (matrixConfig.cyclemailsponsor && position.Sponsor) {
      await emailService.sendEmail(
        position.Sponsor,
        matrixConfig.Subject3 || 'Your Referral Completed a Cycle!',
        matrixConfig.Message3 || 'One of your referrals has completed a matrix cycle.',
        matrixConfig.eformat3 || 2
      );
    }
  }

  // Update user credits
  async updateUserCredits(username, matrixConfig) {
    const bannerCredits = 10; // Default banner credits
    const textCredits = 5;    // Default text credits
    
    await db.execute(
      `UPDATE users SET 
       banners = banners + ?, 
       textads = textads + ?, 
       status = 2 
       WHERE Username = ?`,
      [bannerCredits, textCredits, username]
    );
  }

  // Mark entry as processed
  async markEntryProcessed(entryId) {
    await db.execute(
      'DELETE FROM verifier WHERE ID = ?',
      [entryId]
    );
  }

  // Get matrix statistics
  async getMatrixStats(matrixId) {
    const matrixTable = `matrix${matrixId}`;
    
    const [totalPositions] = await db.execute(`SELECT COUNT(*) as count FROM ${matrixTable}`);
    const [activePositions] = await db.execute(`SELECT COUNT(*) as count FROM ${matrixTable} WHERE CDate IS NULL`);
    const [completedCycles] = await db.execute(`SELECT COUNT(*) as count FROM ${matrixTable} WHERE CDate IS NOT NULL`);
    
    return {
      totalPositions: totalPositions[0].count,
      activePositions: activePositions[0].count,
      completedCycles: completedCycles[0].count
    };
  }

  // Get matrix positions
  async getMatrixPositions(matrixId, page = 1, limit = 20) {
    const matrixTable = `matrix${matrixId}`;
    const offset = (page - 1) * limit;
    
    const [positions] = await db.execute(
      `SELECT * FROM ${matrixTable} ORDER BY ID DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    const [total] = await db.execute(`SELECT COUNT(*) as count FROM ${matrixTable}`);
    
    return {
      positions,
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit)
      }
    };
  }
}

module.exports = new MatrixService(); 