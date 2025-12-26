import type { AdBannerConfig } from "@shared/config/virus";

interface AdBannerProps {
  bannerIndex: number;
  config: AdBannerConfig;
  className?: string;
}

export const AdBanner = ({ bannerIndex, config, className }: AdBannerProps) => {
  return (
    <div className={`adware-banner adware-banner-${bannerIndex} ${className || ""}`}>
      <div className="adware-banner-content">
        <div className="adware-banner-title">{config.title}</div>
        <div className="adware-banner-text">{config.text}</div>
        <div className="adware-banner-subtitle">{config.subtitle}</div>
        <div className="adware-banner-close">✕</div>
      </div>
    </div>
  );
};
