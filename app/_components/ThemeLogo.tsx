import Image from "next/image";

type ThemeLogoProps = {
  width: number;
  height: number;
  className?: string;
  alt?: string;
};

export default function ThemeLogo({
  width,
  height,
  className = "",
  alt = "Project logo",
}: ThemeLogoProps) {
  const imageClassName = className.trim();

  return (
    <>
      <Image
        src="/images/logo(light).png"
        alt={alt}
        width={width}
        height={height}
        className={`theme-logo-light ${imageClassName}`.trim()}
      />
      <Image
        src="/images/logo(dark).png"
        alt={alt}
        width={width}
        height={height}
        className={`theme-logo-dark ${imageClassName}`.trim()}
      />
    </>
  );
}
