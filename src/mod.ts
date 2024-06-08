import { DependencyContainer, container } from "tsyringe";

import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IInRaidConfig } from "@spt-aki/models/spt/config/IInRaidConfig";
import { VFS } from "@spt-aki/utils/VFS";
import { jsonc } from "jsonc";
import path from "node:path";

class ConfigureTraitorScav implements IPreAkiLoadMod
{
    private mod: string
    private logger: ILogger

    private static vfs = container.resolve<VFS>("VFS"); 
    private static config: Config = jsonc.parse(ConfigureTraitorScav.vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")));

    constructor() 
    {
        this.mod = "acidphantasm-configuretraitorscav"; // Set name of mod so we can log it to console later
    }

    public preAkiLoad(container: DependencyContainer): void
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const inRaidConfig: IInRaidConfig = configServer.getConfig<IInRaidConfig>(ConfigTypes.IN_RAID);
        let localChance = ConfigureTraitorScav.config.traitorScavChance;

        if (ConfigureTraitorScav.config.disableTraitorScavs)
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
}
interface Config 
{
    traitorScavChance: number,
    disableTraitorScavs: boolean,
}

module.exports = { mod: new ConfigureTraitorScav() }