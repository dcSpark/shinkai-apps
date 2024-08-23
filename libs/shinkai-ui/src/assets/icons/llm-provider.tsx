import { useFillIds } from '../../hooks/use-fill-ids';
import { cn } from '../../utils';

export const MistralIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={cn('shrink-0', className)} viewBox="0 0 24 24">
      <title>Mistral</title>
      <g fill="none" fillRule="nonzero">
        <path
          d="M15 6v4h-2V6h2zm4-4v4h-2V2h2zM3 2H1h2zM1 2h2v20H1V2zm8 12h2v4H9v-4zm8 0h2v8h-2v-8z"
          fill="#000"
        />
        <path d="M19 2h4v4h-4V2zM3 2h4v4H3V2z" fill="#F7D046" />
        <path d="M15 10V6h8v4h-8zM3 10V6h8v4H3z" fill="#F2A73B" />
        <path d="M3 14v-4h20v4z" fill="#EE792F" />
        <path
          d="M11 14h4v4h-4v-4zm8 0h4v4h-4v-4zM3 14h4v4H3v-4z"
          fill="#EB5829"
        />
        <path d="M19 18h4v4h-4v-4zM3 18h4v4H3v-4z" fill="#EA3326" />
      </g>
    </svg>
  );
};

export const GoogleIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={cn('shrink-0', className)} viewBox="0 0 24 24">
      <title>Google</title>
      <g fill="none" fillRule="nonzero">
        <path
          d="M24 12.267c0-.987-.082-1.707-.258-2.454H12.245v4.454h6.748c-.136 1.106-.87 2.773-2.503 3.893l-.023.149 3.635 2.76.252.024C22.667 19 24 15.92 24 12.267"
          fill="#4285F4"
        />
        <path
          d="M12.245 24c3.306 0 6.081-1.067 8.109-2.907L16.49 18.16c-1.034.707-2.422 1.2-4.245 1.2a7.358 7.358 0 01-6.966-4.987l-.144.012-3.78 2.867-.049.135C3.32 21.307 7.456 24 12.245 24"
          fill="#34A853"
        />
        <path
          d="M5.279 14.373A7.254 7.254 0 014.87 12c0-.827.15-1.627.394-2.373l-.007-.16-3.827-2.912-.125.058A11.816 11.816 0 000 12c0 1.933.476 3.76 1.306 5.387l3.973-3.014"
          fill="#FBBC05"
        />
        <path
          d="M12.245 4.64c2.3 0 3.85.973 4.735 1.787l3.455-3.307C18.313 1.187 15.551 0 12.245 0 7.455 0 3.32 2.693 1.306 6.613l3.96 3.014c.993-2.894 3.74-4.987 6.979-4.987"
          fill="#EB4335"
        />
      </g>
    </svg>
  );
};

export const MetaIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={cn('shrink-0', className)} viewBox="0 0 24 24">
      <title>Meta</title>
      <defs>
        <linearGradient
          id="shinkai-icons-meta-fill-0"
          x1="75.897%"
          x2="26.312%"
          y1="89.199%"
          y2="12.194%"
        >
          <stop offset=".06%" stopColor="#0867DF" />
          <stop offset="45.39%" stopColor="#0668E1" />
          <stop offset="85.91%" stopColor="#0064E0" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-1"
          x1="21.67%"
          x2="97.068%"
          y1="75.874%"
          y2="23.985%"
        >
          <stop offset="13.23%" stopColor="#0064DF" />
          <stop offset="99.88%" stopColor="#0064E0" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-2"
          x1="38.263%"
          x2="60.895%"
          y1="89.127%"
          y2="16.131%"
        >
          <stop offset="1.47%" stopColor="#0072EC" />
          <stop offset="68.81%" stopColor="#0064DF" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-3"
          x1="47.032%"
          x2="52.15%"
          y1="90.19%"
          y2="15.745%"
        >
          <stop offset="7.31%" stopColor="#007CF6" />
          <stop offset="99.43%" stopColor="#0072EC" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-4"
          x1="52.155%"
          x2="47.591%"
          y1="58.301%"
          y2="37.004%"
        >
          <stop offset="7.31%" stopColor="#007FF9" />
          <stop offset="100%" stopColor="#007CF6" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-5"
          x1="37.689%"
          x2="61.961%"
          y1="12.502%"
          y2="63.624%"
        >
          <stop offset="7.31%" stopColor="#007FF9" />
          <stop offset="100%" stopColor="#0082FB" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-6"
          x1="34.808%"
          x2="62.313%"
          y1="68.859%"
          y2="23.174%"
        >
          <stop offset="27.99%" stopColor="#007FF8" />
          <stop offset="91.41%" stopColor="#0082FB" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-7"
          x1="43.762%"
          x2="57.602%"
          y1="6.235%"
          y2="98.514%"
        >
          <stop offset="0%" stopColor="#0082FB" />
          <stop offset="99.95%" stopColor="#0081FA" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-8"
          x1="60.055%"
          x2="39.88%"
          y1="4.661%"
          y2="69.077%"
        >
          <stop offset="6.19%" stopColor="#0081FA" />
          <stop offset="100%" stopColor="#0080F9" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-9"
          x1="30.282%"
          x2="61.081%"
          y1="59.32%"
          y2="33.244%"
        >
          <stop offset="0%" stopColor="#027AF3" />
          <stop offset="100%" stopColor="#0080F9" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-10"
          x1="20.433%"
          x2="82.112%"
          y1="50.001%"
          y2="50.001%"
        >
          <stop offset="0%" stopColor="#0377EF" />
          <stop offset="99.94%" stopColor="#0279F1" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-11"
          x1="40.303%"
          x2="72.394%"
          y1="35.298%"
          y2="57.811%"
        >
          <stop offset=".19%" stopColor="#0471E9" />
          <stop offset="100%" stopColor="#0377EF" />
        </linearGradient>
        <linearGradient
          id="shinkai-icons-meta-fill-12"
          x1="32.254%"
          x2="68.003%"
          y1="19.719%"
          y2="84.908%"
        >
          <stop offset="27.65%" stopColor="#0867DF" />
          <stop offset="100%" stopColor="#0471E9" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="nonzero">
        <path
          d="M6.897 4h-.024l-.031 2.615h.022c1.715 0 3.046 1.357 5.94 6.246l.175.297.012.02 1.62-2.438-.012-.019a48.763 48.763 0 00-1.098-1.716 28.01 28.01 0 00-1.175-1.629C10.413 4.932 8.812 4 6.896 4z"
          fill="url(#shinkai-icons-meta-fill-0)"
        />
        <path
          d="M6.873 4C4.95 4.01 3.247 5.258 2.02 7.17a4.352 4.352 0 00-.01.017l2.254 1.231.011-.017c.718-1.083 1.61-1.774 2.568-1.785h.021L6.896 4h-.023z"
          fill="url(#shinkai-icons-meta-fill-1)"
        />
        <path
          d="M2.019 7.17l-.011.017C1.2 8.447.598 9.995.274 11.664l-.005.022 2.534.6.004-.022c.27-1.467.786-2.828 1.456-3.845l.011-.017L2.02 7.17z"
          fill="url(#shinkai-icons-meta-fill-2)"
        />
        <path
          d="M2.807 12.264l-2.533-.6-.005.022c-.177.918-.267 1.851-.269 2.786v.023l2.598.233v-.023a12.591 12.591 0 01.21-2.44z"
          fill="url(#shinkai-icons-meta-fill-3)"
        />
        <path
          d="M2.677 15.537a5.462 5.462 0 01-.079-.813v-.022L0 14.468v.024a8.89 8.89 0 00.146 1.652l2.535-.585a4.106 4.106 0 01-.004-.022z"
          fill="url(#shinkai-icons-meta-fill-4)"
        />
        <path
          d="M3.27 16.89c-.284-.31-.484-.756-.589-1.328l-.004-.021-2.535.585.004.021c.192 1.01.568 1.85 1.106 2.487l.014.017 2.018-1.745a2.106 2.106 0 01-.015-.016z"
          fill="url(#shinkai-icons-meta-fill-5)"
        />
        <path
          d="M10.78 9.654c-1.528 2.35-2.454 3.825-2.454 3.825-2.035 3.2-2.739 3.917-3.871 3.917a1.545 1.545 0 01-1.186-.508l-2.017 1.744.014.017C2.01 19.518 3.058 20 4.356 20c1.963 0 3.374-.928 5.884-5.33l1.766-3.13a41.283 41.283 0 00-1.227-1.886z"
          fill="#0082FB"
        />
        <path
          d="M13.502 5.946l-.016.016c-.4.43-.786.908-1.16 1.416.378.483.768 1.024 1.175 1.63.48-.743.928-1.345 1.367-1.807l.016-.016-1.382-1.24z"
          fill="url(#shinkai-icons-meta-fill-6)"
        />
        <path
          d="M20.918 5.713C19.853 4.633 18.583 4 17.225 4c-1.432 0-2.637.787-3.723 1.944l-.016.016 1.382 1.24.016-.017c.715-.747 1.408-1.12 2.176-1.12.826 0 1.6.39 2.27 1.075l.015.016 1.589-1.425-.016-.016z"
          fill="#0082FB"
        />
        <path
          d="M23.998 14.125c-.06-3.467-1.27-6.566-3.064-8.396l-.016-.016-1.588 1.424.015.016c1.35 1.392 2.277 3.98 2.361 6.971v.023h2.292v-.022z"
          fill="url(#shinkai-icons-meta-fill-7)"
        />
        <path
          d="M23.998 14.15v-.023h-2.292v.022c.004.14.006.282.006.424 0 .815-.121 1.474-.368 1.95l-.011.022 1.708 1.782.013-.02c.62-.96.946-2.293.946-3.91 0-.083 0-.165-.002-.247z"
          fill="url(#shinkai-icons-meta-fill-8)"
        />
        <path
          d="M21.344 16.52l-.011.02c-.214.402-.519.67-.917.787l.778 2.462a3.493 3.493 0 00.438-.182 3.558 3.558 0 001.366-1.218l.044-.065.012-.02-1.71-1.784z"
          fill="url(#shinkai-icons-meta-fill-9)"
        />
        <path
          d="M19.92 17.393c-.262 0-.492-.039-.718-.14l-.798 2.522c.449.153.927.222 1.46.222.492 0 .943-.073 1.352-.215l-.78-2.462c-.167.05-.341.075-.517.073z"
          fill="url(#shinkai-icons-meta-fill-10)"
        />
        <path
          d="M18.323 16.534l-.014-.017-1.836 1.914.016.017c.637.682 1.246 1.105 1.937 1.337l.797-2.52c-.291-.125-.573-.353-.9-.731z"
          fill="url(#shinkai-icons-meta-fill-11)"
        />
        <path
          d="M18.309 16.515c-.55-.642-1.232-1.712-2.303-3.44l-1.396-2.336-.011-.02-1.62 2.438.012.02.989 1.668c.959 1.61 1.74 2.774 2.493 3.585l.016.016 1.834-1.914a2.353 2.353 0 01-.014-.017z"
          fill="url(#shinkai-icons-meta-fill-12)"
        />
      </g>
    </svg>
  );
};

export const MicrosoftIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={cn('shrink-0', className)} viewBox="0 0 26 25">
      <title>Azure</title>
      <path d="M12.57.982H.908v11.386h11.664V.982z" fill="#F25022" />
      <path d="M25.462.982H13.8v11.386h11.663V.982z" fill="#7FBA00" />
      <path d="M12.57 13.565H.908V24.95h11.664V13.565z" fill="#00A4EF" />
      <path d="M25.463 13.565H13.8V24.95h11.663V13.565z" fill="#FFB900" />
    </svg>
  );
};
