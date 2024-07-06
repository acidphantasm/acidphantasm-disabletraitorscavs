import { DependencyContainer, container } from "tsyringe";

import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IInRaidConfig } from "@spt/models/spt/config/IInRaidConfig";
import { VFS } from "@spt/utils/VFS";
import { jsonc } from "jsonc";
import path from "node:path";

class DisableTraitorScavs implements IPreSptLoadMod, IPostDBLoadMod
{
    private mod: string
    private logger: ILogger

    private static vfs = container.resolve<VFS>("VFS"); 
    private static config: Config = jsonc.parse(DisableTraitorScavs.vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")));

    constructor() 
    {
        this.mod = "acidphantasm-disabletraitorscavs"; // Set name of mod so we can log it to console later
    }
    public preSptLoad(container: DependencyContainer): void
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        const configServer = container.resolve<ConfigServer>("ConfigServer"); 
        const inRaidConfig: IInRaidConfig = configServer.getConfig<IInRaidConfig>(ConfigTypes.IN_RAID);
        let localChance = DisableTraitorScavs.config.traitorScavChance;

        if (DisableTraitorScavs.config.disableTraitorScavs)
        {
            inRaidConfig.playerScavHostileChancePercent = 0;
            this.logger.log(`[${this.mod}] Traitor Scav Chance: ${inRaidConfig.playerScavHostileChancePercent}% - Disabled`, "cyan");
        }
        else
        {
            if (localChance >= 100)
            {
                localChance = 100
                inRaidConfig.playerScavHostileChancePercent = localChance;
                this.logger.log(`[${this.mod}] Traitor Scav Chance: ${inRaidConfig.playerScavHostileChancePercent}%`, "cyan");
            }
            else if (localChance <= 0)
            {
                localChance = 0
                inRaidConfig.playerScavHostileChancePercent = localChance;
                this.logger.log(`[${this.mod}] Traitor Scav Chance: ${inRaidConfig.playerScavHostileChancePercent}% - Disabled`, "cyan");
            }
            else
            {
                inRaidConfig.playerScavHostileChancePercent = localChance;
                this.logger.log(`[${this.mod}] Traitor Scav Chance: ${inRaidConfig.playerScavHostileChancePercent}%`, "cyan");
            }
        }
    }
    
    postDBLoad(container: DependencyContainer): void 
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");        
        const configServer = container.resolve<ConfigServer>("ConfigServer"); 
        const inRaidConfig: IInRaidConfig = configServer.getConfig<IInRaidConfig>(ConfigTypes.IN_RAID);
        const localChance = DisableTraitorScavs.config.traitorScavChance;

        if (inRaidConfig.playerScavHostileChancePercent !== localChance && !DisableTraitorScavs.config.disableTraitorScavs)
        {
            this.logger.error(`[${this.mod}] is being overwritten by another mod. Adjust your load order to have this mod load last.`)
        }
        if (inRaidConfig.playerScavHostileChancePercent !== 0 && DisableTraitorScavs.config.disableTraitorScavs)
        {
            this.logger.error(`[${this.mod}] is being overwritten by another mod. Adjust your load order to have this mod load last.`)
        }
    }
}
interface Config 
{
    traitorScavChance: number,
    disableTraitorScavs: boolean,
}

module.exports = { mod: new DisableTraitorScavs() }