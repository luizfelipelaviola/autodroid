interface IBrowser {
  name?: string;
  version?: string;
}

interface IOrigin {
  host?: string;
  url?: string;
}

export interface IAgentInfoDTO {
  isMobile?: boolean;
  isDesktop?: boolean;
  ip?: string;
  browser?: IBrowser;
  origin?: IOrigin;
  os?: string;
  platform?: string;
}
