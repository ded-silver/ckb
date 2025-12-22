import {
  AD_BANNERS_SET_1,
  AD_BANNERS_SET_2,
  SIDE_BANNERS,
} from "../constants/virusConfig";
import { AdBanner } from "./AdBanner";

interface AdwareBannersProps {
  adBanner: boolean;
  adBannerType: number;
  adBanner2: boolean;
  adBanner2Type: number;
}

export const AdwareBanners = ({
  adBanner,
  adBannerType,
  adBanner2,
  adBanner2Type,
}: AdwareBannersProps) => {
  return (
    <>
      {["tl", "tr", "bl", "br"].map((position) => (
        <div
          key={position}
          className={`adware-banner-corner adware-banner-corner-${position}`}
        >
          <div className="adware-banner-corner-text">AD</div>
        </div>
      ))}

      <div className="adware-banner-side adware-banner-side-left">
        <div className="adware-banner-side-content">
          <div className="adware-banner-side-text">{SIDE_BANNERS.left}</div>
        </div>
      </div>
      <div className="adware-banner-side adware-banner-side-right">
        <div className="adware-banner-side-content">
          <div className="adware-banner-side-text">{SIDE_BANNERS.right}</div>
        </div>
      </div>

      {adBanner && (
        <AdBanner
          bannerIndex={adBannerType}
          config={AD_BANNERS_SET_1[adBannerType]}
        />
      )}

      {adBanner2 && (
        <AdBanner
          bannerIndex={adBanner2Type + 6}
          config={AD_BANNERS_SET_2[adBanner2Type]}
        />
      )}
    </>
  );
};
