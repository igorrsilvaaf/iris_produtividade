import Link from "next/link";

interface LogoProps {
  className?: string;
  asLink?: boolean;
  href?: string;
}

export function Logo({ className = "", asLink = true, href = "/" }: LogoProps) {
  const logoContent = (
    <>
      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#15161c]">
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff5f6d] via-[#ffb270] via-[#c751ff] to-[#4158d0] rounded-full"></div>
          <div className="absolute inset-[3px] rounded-full bg-[#0c0d10]"></div>
          <div className="absolute inset-0 rounded-full" style={{ 
            background: 'conic-gradient(from 0deg, #ff5f6d, #ffb270, #c751ff, #4158d0, #0061ff, #60efff, #43e97b, #a8eb12, #ff5f6d)', 
            width: '100%', 
            height: '100%',
            opacity: 0.9,
            maskImage: 'radial-gradient(circle, transparent 40%, black 45%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 40%, black 45%)'
          }}></div>
        </div>
      </div>
      <span className="text-2xl">Íris</span>
    </>
  );

  if (asLink) {
    return (
      <Link href={href} className={`inline-flex items-center gap-2 ${className}`}>
        {logoContent}
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {logoContent}
    </div>
  );
} 