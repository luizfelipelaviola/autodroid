// DTO import
import { IAgentInfoDTO } from "../types/IAgentInfo.dto";
import { IParsedUserAgentInfoDTO } from "../types/IParsedUserAgentInfo.dto";

export interface IUserAgentInfoProvider {
  readonly initialization: Promise<void>;

  lookup(
    requester: IAgentInfoDTO,
  ): Promise<IParsedUserAgentInfoDTO | undefined>;
}
