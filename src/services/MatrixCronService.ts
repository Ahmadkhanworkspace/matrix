import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { PaymentGatewayService } from './PaymentGatewayService';
import { EmailService } from './EmailService';

interface MembershipLevelConfig {
  id: string;
  name: string;
  fee: number;
  matrixtype: number; // 1=forced, 2=unforced
  levels: number; // 1-10
  forcedmatrix: number; // matrix width (2, 3, 4, etc.)
  refbonus: number;
  refbonuspaid: number; // 0=not paid, 1=paid, 2=auto paid
  payouttype: number; // 1=cycle completion, 2=per referral, 3=on cycle
  matrixbonus: number;
  matchingbonus: number;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
  level10: number;
  level1m: number;
  level2m: number;
  level3m: number;
  level4m: number;
  level5m: number;
  level6m: number;
  level7m: number;
  level8m: number;
  level9m: number;
  level10m: number;
  level1c: number;
  level2c: number;
  level3c: number;
  level4c: number;
  level5c: number;
  level6c: number;
  level7c: number;
  level8c: number;
  level9c: number;
  level10c: number;
  level1cm: number;
  level2cm: number;
  level3cm: number;
  level4cm: number;
  level5cm: number;
  level6cm: number;
  level7cm: number;
  level8cm: number;
  level9cm: number;
  level10cm: number;
  textcreditsentry: number;
  bannercreditsentry: number;
  textcreditscycle: number;
  bannercreditscycle: number;
  reentry: number; // 0=disabled, 1=enabled
  reentrynum: number;
  entry1: number;
  entry1num: number;
  matrixid1: number | null;
  entry2: number;
  entry2num: number;
  matrixid2: number | null;
  entry3: number;
  entry3num: number;
  matrixid3: number | null;
  entry4: number;
  entry4num: number;
  matrixid4: number | null;
  entry5: number;
  entry5num: number;
  matrixid5: number | null;
  welcomemail: number;
  subject1: string | null;
  message1: string | null;
  eformat1: string | null;
  cyclemail: number;
  subject2: string | null;
  message2: string | null;
  eformat2: string | null;
  cyclemailsponsor: number;
  subject3: string | null;
  message3: string | null;
  eformat3: string | null;
}

interface SystemConfig {
  allowLookupForSponsor: boolean;
  freeRefBonus: boolean;
  nonMatrixMatch: boolean;
  reservePercentage: number; // rper
  siteName: string;
  siteUrl: string;
  webmasterEmail: string;
  mailerType: string;
}

export class MatrixCronService {
  private paymentService: PaymentGatewayService;
  private emailService: EmailService;
  private systemConfig: SystemConfig | null = null;

  constructor() {
    this.paymentService = new PaymentGatewayService();
    this.emailService = new EmailService();
  }

  /**
   * Main cron job: Process pending verifier entries
   * Logic: Process up to 24 entries per run, one at a time
   */
  async processVerifierQueue(): Promise<void> {
    try {
      // Check if cron is already running
      const cronJob = await prisma.cronJob.findFirst();
      if (cronJob?.active) {
        logger.warn('Matrix cron job is already running, skipping...');
        return;
      }

      // Mark cron as active
      await prisma.cronJob.upsert({
        where: { id: cronJob?.id || 'default' },
        update: { active: true },
        create: { id: 'default', active: true }
      });

      // Get system configuration
      await this.loadSystemConfig();

      // Get pending verifier entries (up to 24, ordered by date)
      const today = new Date();
      const pendingEntries = await prisma.verifier.findMany({
        where: {
          date: { lte: today }
        },
        orderBy: { date: 'asc' },
        take: 24,
        include: {
          user: true
        }
      });

      logger.info(`Processing ${pendingEntries.length} pending verifier entries`);

      for (const entry of pendingEntries) {
        try {
          // Update cron job lastId
          await prisma.cronJob.update({
            where: { id: cronJob?.id || 'default' },
            data: { lastId: entry.id }
          });

          await this.processVerifierEntry(entry);
          
          // Delete processed entry
          await prisma.verifier.delete({
            where: { id: entry.id }
          });

          logger.info(`Processed verifier entry: ${entry.id}`);
        } catch (error) {
          logger.error(`Error processing verifier entry ${entry.id}:`, error);
          // Continue with next entry
        }
      }

      // Mark cron as inactive
      await prisma.cronJob.update({
        where: { id: cronJob?.id || 'default' },
        data: { active: false, lastRun: new Date() }
      });

      logger.info('Matrix cron job completed');
    } catch (error) {
      logger.error('Error in matrix cron job:', error);
      
      // Ensure cron is marked inactive even on error
      try {
        await prisma.cronJob.updateMany({
          data: { active: false }
        });
      } catch (e) {
        logger.error('Error marking cron inactive:', e);
      }
    }
  }

  /**
   * Process a single verifier entry
   */
  private async processVerifierEntry(entry: any): Promise<void> {
    const username = entry.username;
    const mid = entry.mid;
    const etype = entry.etype;
    const sponsorUsername = entry.sponsor;

    // Get user
    const user = entry.user || await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      throw new Error(`User not found: ${username}`);
    }

    // Get membership level config
    const membershipLevel = await this.getMembershipLevelConfig(mid);
    if (!membershipLevel) {
      throw new Error(`Membership level ${mid} not found`);
    }

    // Handle sponsor assignment
    let refBy = user.sponsorId || null;
    if (sponsorUsername) {
      const sponsor = await prisma.user.findUnique({
        where: { username: sponsorUsername }
      });
      if (sponsor) {
        refBy = sponsor.id;
        // Update user's sponsor if needed
        if (user.sponsorId !== sponsor.id) {
          await prisma.user.update({
            where: { id: user.id },
            data: { sponsorId: sponsor.id }
          });
        }
        
        // Log to global PIF pool
        await prisma.globalPIFPool.create({
          data: {
            username,
            userId: user.id,
            sponsor: sponsorUsername
          }
        });
      }
    }

    // Create matrix position
    const matrixPosition = await this.createMatrixPosition(
      user.id,
      username,
      mid,
      refBy,
      membershipLevel
    );

    if (!matrixPosition) {
      throw new Error('Failed to create matrix position');
    }

    // Distribute referral bonus if applicable
    if (membershipLevel.refbonuspaid > 0 && membershipLevel.refbonus > 0 && refBy) {
      await this.distributeReferralBonus(
        refBy,
        user.id,
        membershipLevel.refbonus,
        membershipLevel.refbonuspaid,
        etype,
        matrixPosition.id,
        mid
      );
    }

    // Send welcome email if enabled
    if (membershipLevel.welcomemail === 1) {
      await this.sendMatrixEmail(
        matrixPosition.id,
        user.username,
        user.email,
        mid,
        1, // welcome email type
        membershipLevel
      );
    }
  }

  /**
   * Create matrix position and assign to sponsor tree
   */
  private async createMatrixPosition(
    userId: string,
    username: string,
    mid: number,
    refBy: string | null,
    config: MembershipLevelConfig
  ): Promise<any> {
    const today = new Date();

    // Find upline (sponsor position in matrix)
    let upline = null;
    if (refBy && this.systemConfig?.allowLookupForSponsor) {
      upline = await this.findSponsorInMatrix(refBy, mid);
    } else if (refBy) {
      const sponsorPosition = await prisma.matrixPosition.findFirst({
        where: {
          userId: refBy,
          matrixLevel: mid,
          status: 'ACTIVE'
        }
      });
      if (sponsorPosition) {
        upline = sponsorPosition.id;
      }
    }

    // Find main ID (user's main position in any matrix)
    let mainId = null;
    const membershipLevels = await prisma.membershipLevel.findMany({
      orderBy: { createdAt: 'desc' }
    });

    for (const ml of membershipLevels) {
      const existingPosition = await prisma.matrixPosition.findFirst({
        where: {
          userId,
          matrixLevel: parseInt(ml.id), // Note: using ID as level identifier
          mainId: { not: null }
        }
      });
      if (existingPosition?.mainId) {
        mainId = existingPosition.mainId;
        break;
      }
    }

    // Create matrix position
    const position = await prisma.matrixPosition.create({
      data: {
        userId,
        username,
        matrixLevel: mid,
        positionPath: `${mid}_${userId}_${Date.now()}`,
        sponsorId: refBy,
        sponsorUsername: refBy ? (await prisma.user.findUnique({ where: { id: refBy } }))?.username : null,
        refBy: upline,
        leader: upline,
        mainId: mainId || null,
        status: 'ACTIVE',
        level1: 0,
        level2: 0,
        level3: 0,
        level4: 0,
        level5: 0,
        level6: 0,
        level7: 0,
        level8: 0,
        level9: 0,
        level10: 0,
        totalEarned: 0,
        cycleCount: 0
      }
    });

    // Update mainId if this is user's first position
    if (!mainId) {
      await prisma.matrixPosition.update({
        where: { id: position.id },
        data: { mainId: position.id }
      });
    }

    // Grant entry credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        bannerCredits: { increment: config.bannercreditsentry },
        textAdCredits: { increment: config.textcreditsentry },
        status: 'ACTIVE' // Set status to active
      }
    });

    // Assign to sponsor tree and distribute bonuses
    if (config.matrixtype === 1) {
      // Forced matrix - find available position in sponsor tree
      await this.assignToSponsorTree(position.id, upline, mid, config);
    } else {
      // Unforced matrix - find any available position
      await this.assignToAvailablePosition(position.id, mid, config);
    }

    return position;
  }

  /**
   * Find sponsor in matrix (with lookup if enabled)
   */
  private async findSponsorInMatrix(sponsorUserId: string, mid: number): Promise<string | null> {
    // Direct lookup
    let position = await prisma.matrixPosition.findFirst({
      where: {
        userId: sponsorUserId,
        matrixLevel: mid,
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'asc' }
    });

    if (position) return position.id;

    // Lookup sponsor's sponsor (up to 5 levels)
    if (this.systemConfig?.allowLookupForSponsor) {
      const sponsor = await prisma.user.findUnique({
        where: { id: sponsorUserId },
        include: { sponsor: true }
      });

      if (sponsor?.sponsorId && sponsor.status === 'ACTIVE') {
        position = await prisma.matrixPosition.findFirst({
          where: {
            userId: sponsor.sponsorId,
            matrixLevel: mid,
            status: 'ACTIVE'
          },
          orderBy: { createdAt: 'asc' }
        });

        if (position) return position.id;

        // Continue lookup up the chain (up to 5 levels)
        let currentSponsor = sponsor.sponsor;
        for (let i = 0; i < 4; i++) {
          if (!currentSponsor?.sponsorId || currentSponsor.status !== 'ACTIVE') break;
          
          position = await prisma.matrixPosition.findFirst({
            where: {
              userId: currentSponsor.sponsorId,
              matrixLevel: mid,
              status: 'ACTIVE'
            },
            orderBy: { createdAt: 'asc' }
          });

          if (position) return position.id;

          currentSponsor = await prisma.user.findUnique({
            where: { id: currentSponsor.sponsorId },
            include: { sponsor: true }
          });
        }
      }
    }

    return null;
  }

  /**
   * Find new upline using spillover logic
   * Logic: Search downline tree up to 10 levels deep for available position
   * (Documentation says 9-level spillover, but code searches up to level 9 which is 10 levels: 1-9)
   */
  private async findNewUpline(
    accountId: string,
    refByPositionId: string | null,
    mid: number,
    config: MembershipLevelConfig
  ): Promise<string | null> {
    if (!refByPositionId) {
      // Find any position with available slots
      const available = await prisma.matrixPosition.findFirst({
        where: {
          matrixLevel: mid,
          status: 'ACTIVE',
          id: { not: accountId },
          level1: { lt: config.forcedmatrix }
        },
        orderBy: { createdAt: 'asc' }
      });
      return available?.id || null;
    }

    const forcedMatrix = config.forcedmatrix;
    const levels = config.levels;

    // Check for spillover at each level (1-9 levels deep, which is up to 10 levels total)
    // Level 1 spillover = direct downlines, Level 9 spillover = 9 levels deep
    for (let spilloverLevel = 1; spilloverLevel <= 9 && spilloverLevel <= levels; spilloverLevel++) {
      const spilloverPosition = await this.findSpilloverAtLevel(
        refByPositionId,
        accountId,
        mid,
        forcedMatrix,
        spilloverLevel
      );
      if (spilloverPosition) {
        return spilloverPosition;
      }
    }

    // Fallback: find any available position
    const available = await prisma.matrixPosition.findFirst({
      where: {
        matrixLevel: mid,
        status: 'ACTIVE',
        id: { not: accountId },
        level1: { lt: forcedMatrix }
      },
      orderBy: { createdAt: 'asc' }
    });

    return available?.id || null;
  }

  /**
   * Find spillover position at specific level depth
   */
  private async findSpilloverAtLevel(
    refByPositionId: string,
    accountId: string,
    mid: number,
    forcedMatrix: number,
    depth: number
  ): Promise<string | null> {
    if (depth === 1) {
      // Level 1: Direct downlines
      const position = await prisma.matrixPosition.findFirst({
        where: {
          refBy: refByPositionId,
          matrixLevel: mid,
          status: 'ACTIVE',
          id: { not: accountId },
          level1: { lt: forcedMatrix }
        },
        orderBy: { createdAt: 'asc' }
      });
      return position?.id || null;
    }

    // For deeper levels, recursively search downline tree
    const downlines = await prisma.matrixPosition.findMany({
      where: {
        refBy: refByPositionId,
        matrixLevel: mid,
        status: 'ACTIVE'
      }
    });

    for (const downline of downlines) {
      if (downline.id === accountId) continue;

      const spillover = await this.findSpilloverAtLevel(
        downline.id,
        accountId,
        mid,
        forcedMatrix,
        depth - 1
      );

      if (spillover) {
        return spillover;
      }
    }

    return null;
  }

  /**
   * Assign position to sponsor tree (forced matrix logic)
   */
  private async assignToSponsorTree(
    accountId: string,
    upline: string | null,
    mid: number,
    config: MembershipLevelConfig
  ): Promise<void> {
    if (!upline) {
      // No upline - find any available position
      const available = await prisma.matrixPosition.findFirst({
        where: {
          matrixLevel: mid,
          status: 'ACTIVE',
          id: { not: accountId },
          level1: { lt: config.forcedmatrix }
        },
        orderBy: { createdAt: 'asc' }
      });

      if (available) {
        await this.assignReferral(accountId, available.id, 0, 1, mid, config);
      }
      return;
    }

    // Get upline position
    const uplinePosition = await prisma.matrixPosition.findUnique({
      where: { id: upline }
    });

    if (!uplinePosition) {
      // Upline not found - find any available
      const available = await prisma.matrixPosition.findFirst({
        where: {
          matrixLevel: mid,
          status: 'ACTIVE',
          id: { not: accountId },
          level1: { lt: config.forcedmatrix }
        },
        orderBy: { createdAt: 'asc' }
      });

      if (available) {
        await this.assignReferral(accountId, available.id, 0, 1, mid, config);
      }
      return;
    }

    // Check if upline's level1 is full
    const levelFull = this.isLevelFull(uplinePosition, 1, config);

    if (levelFull) {
      // Find next available position in upline's tree using spillover
      const newUpline = await this.findNewUpline(accountId, upline, mid, config);
      if (newUpline) {
        await this.assignReferral(accountId, newUpline, 0, 1, mid, config);
      } else {
        // Fallback to any available position
        const available = await prisma.matrixPosition.findFirst({
          where: {
            matrixLevel: mid,
            status: 'ACTIVE',
            id: { not: accountId },
            level1: { lt: config.forcedmatrix }
          },
          orderBy: { createdAt: 'asc' }
        });

        if (available) {
          await this.assignReferral(accountId, available.id, 0, 1, mid, config);
        }
      }
    } else {
      // Assign directly to upline
      await this.assignReferral(accountId, upline, 1, 1, mid, config);
    }
  }

  /**
   * Assign to any available position (unforced matrix)
   */
  private async assignToAvailablePosition(
    accountId: string,
    mid: number,
    config: MembershipLevelConfig
  ): Promise<void> {
    const available = await prisma.matrixPosition.findFirst({
      where: {
        matrixLevel: mid,
        status: 'ACTIVE',
        id: { not: accountId },
        level1: { lt: config.forcedmatrix }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (available) {
      await this.assignReferral(accountId, available.id, 0, 1, mid, config);
    }
  }

  /**
   * Assign referral and distribute bonuses
   * This is the core bonus distribution logic
   */
  private async assignReferral(
    accountId: string,
    refId: string,
    status: number,
    level: number,
    mid: number,
    config: MembershipLevelConfig
  ): Promise<void> {
    const today = new Date();

    // Update ref_by if status is 0
    if (status === 0) {
      await prisma.matrixPosition.update({
        where: { id: accountId },
        data: { refBy: refId }
      });
    }

    // Check if we should continue (level <= max levels)
    if (level > config.levels) {
      return;
    }

    // Get referrer position
    const referrerPosition = await prisma.matrixPosition.findUnique({
      where: { id: refId },
      include: { user: true }
    });

    if (!referrerPosition) {
      return;
    }

    // Check if referrer is in matrix (for matching bonus eligibility)
    const referrerInMatrix = await prisma.matrixPosition.findFirst({
      where: {
        userId: referrerPosition.userId,
        matrixLevel: mid,
        status: 'ACTIVE',
        id: { not: refId }
      }
    });

    const err = !referrerInMatrix && !this.systemConfig?.nonMatrixMatch ? 1 : 0;

    // Distribute bonuses based on level and payout type
    const levelIndex = level - 1;
    const levelCounters = [
      referrerPosition.level1,
      referrerPosition.level2,
      referrerPosition.level3,
      referrerPosition.level4,
      referrerPosition.level5,
      referrerPosition.level6,
      referrerPosition.level7,
      referrerPosition.level8,
      referrerPosition.level9,
      referrerPosition.level10
    ];

    const levelBonus = [config.level1, config.level2, config.level3, config.level4, config.level5,
                        config.level6, config.level7, config.level8, config.level9, config.level10][levelIndex];
    const levelMatching = [config.level1m, config.level2m, config.level3m, config.level4m, config.level5m,
                          config.level6m, config.level7m, config.level8m, config.level9m, config.level10m][levelIndex];
    const levelCycle = [config.level1c, config.level2c, config.level3c, config.level4c, config.level5c,
                       config.level6c, config.level7c, config.level8c, config.level9c, config.level10c][levelIndex];
    const levelCycleMatching = [config.level1cm, config.level2cm, config.level3cm, config.level4cm, config.level5cm,
                               config.level6cm, config.level7cm, config.level8cm, config.level9cm, config.level10cm][levelIndex];

    // Increment level counter
    const levelField = `level${level}` as keyof typeof referrerPosition;
    await prisma.matrixPosition.update({
      where: { id: refId },
      data: {
        [levelField]: { increment: 1 }
      }
    });

    const currentCount = levelCounters[levelIndex] + 1;
    // Level capacity formula: fN = forcedmatrix^N
    const levelCapacity = Math.pow(config.forcedmatrix, level);
    const levelFull = currentCount >= levelCapacity;

    // Handle bonuses based on payout type
    if (config.payouttype === 2) {
      // Payout type 2: Per referral bonus
      await this.distributeLevelBonus(
        refId,
        referrerPosition.userId,
        referrerPosition.username,
        levelBonus,
        mid,
        level,
        err === 0 ? levelMatching : 0,
        referrerPosition.sponsorId,
        today
      );
    }

    // Check for cycle completion
    if (levelFull && level === config.levels) {
      await this.handleCycleCompletion(refId, referrerPosition, mid, config, err === 0, today);
    } else if (levelFull && config.payouttype === 3) {
      // Payout type 3: Cycle bonus on level completion
      await this.distributeCycleBonus(
        refId,
        referrerPosition.userId,
        referrerPosition.username,
        levelCycle,
        mid,
        level,
        err === 0 ? levelCycleMatching : 0,
        referrerPosition.sponsorId,
        today
      );

      if (level === config.levels) {
        await this.handleCycleCompletion(refId, referrerPosition, mid, config, err === 0, today);
      }
    } else if (levelFull && config.payouttype === 1 && level === config.levels) {
      // Payout type 1: Matrix bonus on cycle completion
      await this.distributeMatrixBonus(
        refId,
        referrerPosition.userId,
        referrerPosition.username,
        config.matrixbonus,
        config.matchingbonus,
        mid,
        err === 0,
        referrerPosition.sponsorId,
        today
      );

      await this.handleCycleCompletion(refId, referrerPosition, mid, config, err === 0, today);
    }

    // Continue up the tree if needed
    const referralId = referrerPosition.refBy;
    if (referralId) {
      await this.assignReferral(accountId, referralId, 1, level + 1, mid, config);
    }
  }

  /**
   * Distribute level bonus (per referral bonus)
   */
  private async distributeLevelBonus(
    positionId: string,
    userId: string,
    username: string,
    bonus: number,
    mid: number,
    level: number,
    matchingBonus: number,
    sponsorId: string | null,
    today: Date
  ): Promise<void> {
    if (bonus <= 0) return;

    const reservePercentage = this.systemConfig?.reservePercentage || 0;
    const reserveAmount = (bonus * reservePercentage) / 100;
    const paidAmount = bonus - reserveAmount;

    // Update position total
    await prisma.matrixPosition.update({
      where: { id: positionId },
      data: {
        totalEarned: { increment: bonus }
      }
    });

    // Update user earnings
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalEarnings: { increment: bonus },
        unpaidEarnings: { increment: paidAmount },
        rrUnpaid: { increment: reserveAmount }
      }
    });

    // Log transaction
    await prisma.transactionLog.create({
      data: {
        username,
        userId,
        memid: parseInt(positionId), // Using position ID as reference
        matrix: mid,
        amount: bonus,
        purpose: `Level ${level} Referral Bonus`
      }
    });

    // Auto-withdraw if enabled
    await this.attemptAutoWithdrawal(userId, bonus, today);

    // Distribute matching bonus to sponsor
    if (matchingBonus > 0 && sponsorId) {
      await this.distributeMatchingBonus(sponsorId, positionId, mid, matchingBonus, today);
    }
  }

  /**
   * Distribute cycle bonus
   */
  private async distributeCycleBonus(
    positionId: string,
    userId: string,
    username: string,
    bonus: number,
    mid: number,
    level: number,
    matchingBonus: number,
    sponsorId: string | null,
    today: Date
  ): Promise<void> {
    if (bonus <= 0) return;

    const reservePercentage = this.systemConfig?.reservePercentage || 0;
    const reserveAmount = (bonus * reservePercentage) / 100;
    const paidAmount = bonus - reserveAmount;

    await prisma.matrixPosition.update({
      where: { id: positionId },
      data: {
        totalEarned: { increment: bonus }
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalEarnings: { increment: bonus },
        unpaidEarnings: { increment: paidAmount },
        rrUnpaid: { increment: reserveAmount }
      }
    });

    await prisma.transactionLog.create({
      data: {
        username,
        userId,
        memid: parseInt(positionId),
        matrix: mid,
        amount: bonus,
        purpose: `Level ${level} Cycle Bonus`
      }
    });

    await this.attemptAutoWithdrawal(userId, bonus, today);

    if (matchingBonus > 0 && sponsorId) {
      await this.distributeMatchingBonus(sponsorId, positionId, mid, matchingBonus, today);
    }
  }

  /**
   * Distribute matrix bonus (on cycle completion)
   */
  private async distributeMatrixBonus(
    positionId: string,
    userId: string,
    username: string,
    matrixBonus: number,
    matchingBonus: number,
    mid: number,
    hasMatchingBonus: boolean,
    sponsorId: string | null,
    today: Date
  ): Promise<void> {
    if (matrixBonus <= 0) return;

    const reservePercentage = this.systemConfig?.reservePercentage || 0;
    const reserveAmount = (matrixBonus * reservePercentage) / 100;
    const paidAmount = matrixBonus - reserveAmount;

    await prisma.matrixPosition.update({
      where: { id: positionId },
      data: {
        totalEarned: { increment: matrixBonus }
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalEarnings: { increment: matrixBonus },
        unpaidEarnings: { increment: paidAmount },
        rrUnpaid: { increment: reserveAmount }
      }
    });

    await prisma.transactionLog.create({
      data: {
        username,
        userId,
        memid: parseInt(positionId),
        matrix: mid,
        amount: matrixBonus,
        purpose: 'Matrix Cycle Completion Bonus'
      }
    });

    await this.attemptAutoWithdrawal(userId, matrixBonus, today);

    if (matchingBonus > 0 && hasMatchingBonus && sponsorId) {
      await this.distributeMatchingBonus(sponsorId, positionId, mid, matchingBonus, today);
    }
  }

  /**
   * Distribute matching bonus to sponsor
   */
  private async distributeMatchingBonus(
    sponsorId: string,
    positionId: string,
    mid: number,
    bonus: number,
    today: Date
  ): Promise<void> {
    if (bonus <= 0) return;

    const sponsor = await prisma.user.findUnique({
      where: { id: sponsorId }
    });

    if (!sponsor) return;

    const reservePercentage = this.systemConfig?.reservePercentage || 0;
    const reserveAmount = (bonus * reservePercentage) / 100;
    const paidAmount = bonus - reserveAmount;

    await prisma.user.update({
      where: { id: sponsorId },
      data: {
        totalEarnings: { increment: bonus },
        unpaidEarnings: { increment: paidAmount },
        rrUnpaid: { increment: reserveAmount }
      }
    });

    await prisma.transactionLog.create({
      data: {
        username: sponsor.username,
        userId: sponsorId,
        memid: parseInt(positionId),
        matrix: mid,
        amount: bonus,
        purpose: '100% Matching Bonus'
      }
    });

    await this.attemptAutoWithdrawal(sponsorId, bonus, today);
  }

  /**
   * Distribute referral bonus
   */
  private async distributeReferralBonus(
    sponsorId: string,
    newUserId: string,
    bonus: number,
    refbonuspaid: number,
    etype: number,
    positionId: string,
    mid: number
  ): Promise<void> {
    if (bonus <= 0) return;

    const sponsor = await prisma.user.findUnique({
      where: { id: sponsorId }
    });

    if (!sponsor) return;

    // Check if sponsor is eligible (status ACTIVE or FREE with freeRefBonus enabled)
    const isEligible = sponsor.status === 'ACTIVE' ||
                      (sponsor.status === 'PENDING' && sponsor.memberType === 'FREE' && this.systemConfig?.freeRefBonus);

    if (!isEligible) return;

    // Check payment timing (etype=0 always, or etype=1 and refbonuspaid=2)
    if (etype !== 0 && (etype !== 1 || refbonuspaid !== 2)) {
      return;
    }

    const reservePercentage = this.systemConfig?.reservePercentage || 0;
    const reserveAmount = (bonus * reservePercentage) / 100;
    const paidAmount = bonus - reserveAmount;

    await prisma.user.update({
      where: { id: sponsorId },
      data: {
        totalEarnings: { increment: bonus },
        unpaidEarnings: { increment: paidAmount },
        rrUnpaid: { increment: reserveAmount }
      }
    });

    await prisma.transactionLog.create({
      data: {
        username: sponsor.username,
        userId: sponsorId,
        memid: parseInt(positionId),
        matrix: mid,
        amount: bonus,
        purpose: 'Referral Bonus'
      }
    });

    // Auto-withdraw if enabled (refbonuspaid=2)
    if (refbonuspaid === 2) {
      await this.attemptAutoWithdrawal(sponsorId, bonus, new Date());
    }
  }

  /**
   * Handle cycle completion
   */
  private async handleCycleCompletion(
    positionId: string,
    position: any,
    mid: number,
    config: MembershipLevelConfig,
    hasMatchingBonus: boolean,
    today: Date
  ): Promise<void> {
    // Mark position as cycled
    await prisma.matrixPosition.update({
      where: { id: positionId },
      data: {
        cycledAt: today,
        cycleCount: { increment: 1 }
      }
    });

    // Grant cycle credits
    await prisma.user.update({
      where: { id: position.userId },
      data: {
        bannerCredits: { increment: config.bannercreditscycle },
        textAdCredits: { increment: config.textcreditscycle }
      }
    });

    // Send cycle completion email
    if (config.cyclemail === 1) {
      await this.sendMatrixEmail(
        positionId,
        position.user.username,
        position.user.email,
        mid,
        2, // cycle completion email
        config
      );
    }

    // Send sponsor notification email
    if (config.cyclemailsponsor === 1 && hasMatchingBonus && position.sponsorId) {
      const sponsor = await prisma.user.findUnique({
        where: { id: position.sponsorId }
      });
      if (sponsor) {
        await this.sendMatrixEmail(
          positionId,
          sponsor.username,
          sponsor.email,
          mid,
          3, // sponsor notification email
          config,
          position.user.username
        );
      }
    }

    logger.info(`User ${position.user.username} Position ${positionId} has cycled ${config.name}!`);

    // Create re-entries
    if (config.reentry === 1 && position.user.username !== 'admin') {
      for (let i = 0; i < config.reentrynum; i++) {
        await prisma.verifier.create({
          data: {
            username: position.user.username,
            userId: position.userId,
            mid,
            date: today,
            etype: 1 // re-entry
          }
        });
      }
    }

    // Create cross-matrix entries
    const crossMatrixEntries = [
      { enabled: config.entry1, count: config.entry1num, matrixId: config.matrixid1 },
      { enabled: config.entry2, count: config.entry2num, matrixId: config.matrixid2 },
      { enabled: config.entry3, count: config.entry3num, matrixId: config.matrixid3 },
      { enabled: config.entry4, count: config.entry4num, matrixId: config.matrixid4 },
      { enabled: config.entry5, count: config.entry5num, matrixId: config.matrixid5 }
    ];

    for (const entry of crossMatrixEntries) {
      if (entry.enabled === 1 && entry.matrixId && position.user.username !== 'admin') {
        for (let i = 0; i < entry.count; i++) {
          // Check for existing recent entries to prevent duplicates (3 minute window)
          const threeMinutesAgo = new Date(today.getTime() - 3 * 60 * 1000);
          
          const recentVerifier = await prisma.verifier.findFirst({
            where: {
              username: position.user.username,
              mid: entry.matrixId,
              date: { gte: threeMinutesAgo }
            },
            orderBy: { date: 'desc' }
          });

          const recentPosition = await prisma.matrixPosition.findFirst({
            where: {
              userId: position.userId,
              matrixLevel: entry.matrixId,
              createdAt: { gte: threeMinutesAgo }
            },
            orderBy: { createdAt: 'desc' }
          });

          let entryDate = today;
          if (recentVerifier) {
            entryDate = new Date(recentVerifier.date.getTime() + 3 * 60 * 1000);
          } else if (recentPosition) {
            entryDate = new Date(recentPosition.createdAt.getTime() + 3 * 60 * 1000);
          }

          await prisma.verifier.create({
            data: {
              username: position.user.username,
              userId: position.userId,
              mid: entry.matrixId,
              date: entryDate,
              etype: 0
            }
          });
        }
      }
    }
  }

  /**
   * Attempt automatic withdrawal via payment gateway
   */
  private async attemptAutoWithdrawal(userId: string, amount: number, today: Date): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || amount <= 0) {
        return;
      }

      // Get wallet address (only tronWallet exists in current schema)
      const walletAddress = user.tronWallet;
      const currency = 'TRX'; // Default to TRX for TronWallet
      
      if (!walletAddress) {
        // No wallet address available
        logger.warn(`No wallet address for user ${user.username}, skipping auto-withdrawal`);
        return;
      }

      // Get active payment gateway (prefer NOWPayments, fallback to CoinPayments)
      let gateway = await prisma.paymentGatewayConfig.findFirst({
        where: {
          isActive: true,
          gateway: 'NOWPAYMENTS'
        }
      });

      if (!gateway) {
        gateway = await prisma.paymentGatewayConfig.findFirst({
          where: {
            isActive: true,
            gateway: 'COINPAYMENTS'
          }
        });
      }

      if (!gateway) {
        logger.warn('No active payment gateway found for auto-withdrawal');
        return;
      }

      logger.info(`Auto-withdrawal attempt: ${amount} ${currency} for user ${user.username} via ${gateway.gateway}`);

      // Import gateway class
      let gatewayClass;
      if (gateway.gateway === 'COINPAYMENTS') {
        const { CoinPaymentsGateway } = await import('./gateways/CoinPaymentsGateway');
        gatewayClass = new CoinPaymentsGateway();
      } else if (gateway.gateway === 'NOWPAYMENTS') {
        const { NOWPaymentsGateway } = await import('./gateways/NOWPaymentsGateway');
        gatewayClass = new NOWPaymentsGateway();
      } else {
        logger.warn(`Unsupported gateway for auto-withdrawal: ${gateway.gateway}`);
        return;
      }

      // Create withdrawal via gateway
      const result = await gatewayClass.createWithdrawal({
        amount,
        currency,
        address: walletAddress,
        autoConfirm: true,
        config: gateway.config as Record<string, any>
      });

      if (result.success && result.transactionId) {
        // Update user balances
        await prisma.user.update({
          where: { id: userId },
          data: {
            unpaidEarnings: { decrement: amount },
            paidEarnings: { increment: amount }
          }
        });

        // Create withdrawal transaction record
        await prisma.withdrawalTransaction.create({
          data: {
            username: user.username,
            userId: user.id,
            paymentMode: `${gateway.gateway}: ${result.transactionId}`,
            amount,
            approved: 1,
            date: today
          }
        });

        logger.info(`Auto-withdrawal completed: ${result.transactionId} for ${user.username}`);
      } else {
        logger.error(`Auto-withdrawal failed for ${user.username}: ${result.error}`);
        // Don't update balances if withdrawal failed
      }
    } catch (error) {
      logger.error('Error in auto-withdrawal:', error);
      // Don't throw - allow processing to continue
    }
  }

  /**
   * Send matrix-related email
   */
  private async sendMatrixEmail(
    positionId: string,
    username: string,
    email: string,
    mid: number,
    emailType: number, // 1=welcome, 2=cycle, 3=sponsor
    config: MembershipLevelConfig,
    refName?: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user || !email) {
        return;
      }

      let subject = '';
      let message = '';
      let format: 'html' | 'text' = 'html';

      if (emailType === 1) {
        subject = config.subject1 || '';
        message = config.message1 || '';
        // eformat: 1=text, 2=HTML (default)
        format = (config.eformat1 === 1 || config.eformat1 === '1' || config.eformat1?.toLowerCase() === 'text') ? 'text' : 'html';
      } else if (emailType === 2) {
        subject = config.subject2 || '';
        message = config.message2 || '';
        format = (config.eformat2 === 1 || config.eformat2 === '1' || config.eformat2?.toLowerCase() === 'text') ? 'text' : 'html';
      } else if (emailType === 3) {
        subject = config.subject3 || '';
        message = config.message3 || '';
        format = (config.eformat3 === 1 || config.eformat3 === '1' || config.eformat3?.toLowerCase() === 'text') ? 'text' : 'html';
      }

      // Replace template variables
      subject = this.replaceTemplateVariables(subject, user, positionId, config.name, refName);
      message = this.replaceTemplateVariables(message, user, positionId, config.name, refName);

      // Send email
      await this.emailService.sendEmail({
        to: email,
        subject,
        html: format === 'html' ? message : undefined,
        text: format === 'text' ? message : undefined
      });

      logger.info(`Matrix email sent to ${email} (type: ${emailType})`);
    } catch (error) {
      logger.error('Error sending matrix email:', error);
      // Don't throw - allow processing to continue
    }
  }

  /**
   * Replace template variables in email content
   */
  private replaceTemplateVariables(
    content: string,
    user: any,
    positionId: string,
    matrixName: string,
    refName?: string
  ): string {
    // Get user's full name (handle cases where fields might not exist)
    const fullName = (user.firstName || '') + ' ' + (user.lastName || '');
    const userName = fullName.trim() || user.name || user.username;

    const replacements: Record<string, string> = {
      '{name}': userName,
      '{email}': user.email || '',
      '{username}': user.username || '',
      '{password}': '****', // Never include actual password for security
      '{id}': positionId || '',
      '{matrix}': matrixName || '',
      '{refname}': refName || '',
      '{sitename}': this.systemConfig?.siteName || 'Matrix MLM',
      '{siteurl}': this.systemConfig?.siteUrl || ''
    };

    let result = content || '';
    // Replace all variables (case-insensitive, global replace)
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'gi');
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * Check if a level is full
   */
  private isLevelFull(position: any, level: number, config: MembershipLevelConfig): boolean {
    const levelCount = position[`level${level}` as keyof typeof position] as number;
    const maxCount = Math.pow(config.forcedmatrix, level);
    return levelCount >= maxCount;
  }

  /**
   * Get membership level configuration
   * Note: mid is the numeric membership level ID (1, 2, 3, etc.)
   * We need to map this to MembershipLevel. For now, we'll try to find by name matching MatrixConfig
   */
  private async getMembershipLevelConfig(mid: number): Promise<MembershipLevelConfig | null> {
    // First get MatrixConfig to get the name
    const matrixConfig = await prisma.matrixConfig.findUnique({
      where: { level: mid }
    });

    if (!matrixConfig) return null;

    // Try to find MembershipLevel by matching name (or first one if no better mapping exists)
    // In production, you'd want a numeric ID field in MembershipLevel or a mapping table
    const membershipLevel = await prisma.membershipLevel.findFirst({
      where: {
        name: { contains: matrixConfig.name, mode: 'insensitive' }
      }
    });

    // If MembershipLevel found, use it
    if (membershipLevel) {
      return {
        id: membershipLevel.id,
        name: membershipLevel.name,
        fee: membershipLevel.fee,
        matrixtype: membershipLevel.matrixtype,
        levels: membershipLevel.levels,
        forcedmatrix: membershipLevel.forcedmatrix,
        refbonus: membershipLevel.refbonus,
        refbonuspaid: membershipLevel.refbonuspaid,
        payouttype: membershipLevel.payouttype,
        matrixbonus: membershipLevel.matrixbonus,
        matchingbonus: membershipLevel.matchingbonus,
        level1: membershipLevel.level1,
        level2: membershipLevel.level2,
        level3: membershipLevel.level3,
        level4: membershipLevel.level4,
        level5: membershipLevel.level5,
        level6: membershipLevel.level6,
        level7: membershipLevel.level7,
        level8: membershipLevel.level8,
        level9: membershipLevel.level9,
        level10: membershipLevel.level10,
        level1m: membershipLevel.level1m,
        level2m: membershipLevel.level2m,
        level3m: membershipLevel.level3m,
        level4m: membershipLevel.level4m,
        level5m: membershipLevel.level5m,
        level6m: membershipLevel.level6m,
        level7m: membershipLevel.level7m,
        level8m: membershipLevel.level8m,
        level9m: membershipLevel.level9m,
        level10m: membershipLevel.level10m,
        level1c: membershipLevel.level1c,
        level2c: membershipLevel.level2c,
        level3c: membershipLevel.level3c,
        level4c: membershipLevel.level4c,
        level5c: membershipLevel.level5c,
        level6c: membershipLevel.level6c,
        level7c: membershipLevel.level7c,
        level8c: membershipLevel.level8c,
        level9c: membershipLevel.level9c,
        level10c: membershipLevel.level10c,
        level1cm: membershipLevel.level1cm,
        level2cm: membershipLevel.level2cm,
        level3cm: membershipLevel.level3cm,
        level4cm: membershipLevel.level4cm,
        level5cm: membershipLevel.level5cm,
        level6cm: membershipLevel.level6cm,
        level7cm: membershipLevel.level7cm,
        level8cm: membershipLevel.level8cm,
        level9cm: membershipLevel.level9cm,
        level10cm: membershipLevel.level10cm,
        textcreditsentry: membershipLevel.textcreditsentry,
        bannercreditsentry: membershipLevel.bannercreditsentry,
        textcreditscycle: membershipLevel.textcreditscycle,
        bannercreditscycle: membershipLevel.bannercreditscycle,
        reentry: membershipLevel.reentry,
        reentrynum: membershipLevel.reentrynum,
        entry1: membershipLevel.entry1,
        entry1num: membershipLevel.entry1num,
        matrixid1: membershipLevel.matrixid1,
        entry2: membershipLevel.entry2,
        entry2num: membershipLevel.entry2num,
        matrixid2: membershipLevel.matrixid2,
        entry3: membershipLevel.entry3,
        entry3num: membershipLevel.entry3num,
        matrixid3: membershipLevel.matrixid3,
        entry4: membershipLevel.entry4,
        entry4num: membershipLevel.entry4num,
        matrixid4: membershipLevel.matrixid4,
        entry5: membershipLevel.entry5,
        entry5num: membershipLevel.entry5num,
        matrixid5: membershipLevel.matrixid5,
        welcomemail: membershipLevel.welcomemail,
        subject1: membershipLevel.subject1,
        message1: membershipLevel.message1,
        eformat1: membershipLevel.eformat1,
        cyclemail: membershipLevel.cyclemail,
        subject2: membershipLevel.subject2,
        message2: membershipLevel.message2,
        eformat2: membershipLevel.eformat2,
        cyclemailsponsor: membershipLevel.cyclemailsponsor,
        subject3: membershipLevel.subject3,
        message3: membershipLevel.message3,
        eformat3: membershipLevel.eformat3
      };
    }

    // Fallback to MatrixConfig with defaults
    return {
      id: matrixConfig.id,
      name: matrixConfig.name,
      fee: matrixConfig.price,
      matrixtype: 1,
      levels: matrixConfig.matrixDepth,
      forcedmatrix: matrixConfig.matrixWidth,
      refbonus: matrixConfig.referralBonus,
      refbonuspaid: 1,
      payouttype: 1,
      matrixbonus: matrixConfig.matrixBonus,
      matchingbonus: matrixConfig.matchingBonus,
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0,
      level6: 0,
      level7: 0,
      level8: 0,
      level9: 0,
      level10: 0,
      level1m: 0,
      level2m: 0,
      level3m: 0,
      level4m: 0,
      level5m: 0,
      level6m: 0,
      level7m: 0,
      level8m: 0,
      level9m: 0,
      level10m: 0,
      level1c: 0,
      level2c: 0,
      level3c: 0,
      level4c: 0,
      level5c: 0,
      level6c: 0,
      level7c: 0,
      level8c: 0,
      level9c: 0,
      level10c: 0,
      level1cm: 0,
      level2cm: 0,
      level3cm: 0,
      level4cm: 0,
      level5cm: 0,
      level6cm: 0,
      level7cm: 0,
      level8cm: 0,
      level9cm: 0,
      level10cm: 0,
      textcreditsentry: 0,
      bannercreditsentry: 0,
      textcreditscycle: 0,
      bannercreditscycle: 0,
      reentry: 0,
      reentrynum: 0,
      entry1: 0,
      entry1num: 0,
      matrixid1: null,
      entry2: 0,
      entry2num: 0,
      matrixid2: null,
      entry3: 0,
      entry3num: 0,
      matrixid3: null,
      entry4: 0,
      entry4num: 0,
      matrixid4: null,
      entry5: 0,
      entry5num: 0,
      matrixid5: null,
      welcomemail: 0,
      subject1: null,
      message1: null,
      eformat1: null,
      cyclemail: 0,
      subject2: null,
      message2: null,
      eformat2: null,
      cyclemailsponsor: 0,
      subject3: null,
      message3: null,
      eformat3: null
    } as MembershipLevelConfig;
  }

  /**
   * Load system configuration
   */
  private async loadSystemConfig(): Promise<void> {
    const configs = await prisma.systemConfig.findMany({
      where: {
        key: { in: ['allow_lookup_for_sponsor', 'free_ref_bonus', 'non_matrix_match', 'reserve_percentage', 'site_name', 'site_url', 'webmaster_email', 'mailer_type'] }
      }
    });

    const configMap: Record<string, string> = {};
    configs.forEach(c => {
      configMap[c.key] = c.value;
    });

    this.systemConfig = {
      allowLookupForSponsor: configMap['allow_lookup_for_sponsor'] === '1',
      freeRefBonus: configMap['free_ref_bonus'] === '1',
      nonMatrixMatch: configMap['non_matrix_match'] === '1',
      reservePercentage: parseFloat(configMap['reserve_percentage'] || '0'),
      siteName: configMap['site_name'] || 'Matrix MLM',
      siteUrl: configMap['site_url'] || '',
      webmasterEmail: configMap['webmaster_email'] || '',
      mailerType: configMap['mailer_type'] || 'smtp'
    };
  }

  /**
   * Get pending verifier count
   */
  async getPendingCount(): Promise<number> {
    const today = new Date();
    return await prisma.verifier.count({
      where: {
        date: { lte: today }
      }
    });
  }
}
