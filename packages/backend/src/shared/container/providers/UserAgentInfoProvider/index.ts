// Provider import
import { GeoLookupUserAgentInfoProvider } from "./implementations/geoLookupUserAgentInfo.provider";

const providers = {
  geolookup: GeoLookupUserAgentInfoProvider,
};

const UserAgentInfoProvider = providers.geolookup;

export { UserAgentInfoProvider };
