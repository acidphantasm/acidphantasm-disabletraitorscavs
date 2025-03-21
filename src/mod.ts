import { DependencyContainer, container } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IInRaidConfig } from "@spt/models/spt/config/IInRaidConfig";
import { jsonc } from "jsonc";
import path from "node:path";
import { FileSystemSync } from "@spt/utils/FileSystemSync";

class DisableTraitorScavs implements IPostDBLoadMod
{
    private mod: string

    private static fileSystemSync = container.resolve<FileSystemSync>("FileSystemSync"); 
    private static config: Config = jsonc.parse(DisableTraitorScavs.fileSystemSync.read(path.resolve(__dirname, "../config/config.jsonc")));

    constructor() 
    {
        this.mod = "acidphantasm-disabletraitorscavs"; // Set name of mod so we can log it to console later
    }

    postDBLoad(container: DependencyContainer): void 
    {
        const configServer = container.resolve<ConfigServer>("ConfigServer"); 
        const inRaidConfig: IInRaidConfig = configServer.getConfig<IInRaidConfig>(ConfigTypes.IN_RAID);
        let localChance = DisableTraitorScavs.config.traitorScavChance;

        if (DisableTraitorScavs.config.disableTraitorScavs)
        {
            inRaidConfig.playerScavHostileChancePercent = 0;
        }
        else
        {
            if (localChance >= 100)
            {
                localChance = 100
                inRaidConfig.playerScavHostileChancePercent = localChance;
            }
            else if (localChance <= 0)
            {
                localChance = 0
                inRaidConfig.playerScavHostileChancePercent = localChance;
            }
            else
            {
                inRaidConfig.playerScavHostileChancePercent = localChance;
            }
        }
    }
}
interface Config 
{
    traitorScavChance: number,
    disableTraitorScavs: boolean,
}

module.exports = { mod: new DisableTraitorScavs() }