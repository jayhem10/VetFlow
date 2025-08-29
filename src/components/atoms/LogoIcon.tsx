import React from 'react'

interface LogoIconProps {
  size?: number | string
  className?: string
  title?: string
}

export function LogoIcon({ size = 32, className, title }: LogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
    >
      {title ? <title>{title}</title> : null}
      <g fill="currentColor">
        <ellipse transform="rotate(15 60 75)" cx="60" cy="75" rx="22" ry="18" />
        <ellipse transform="rotate(15 40 50)" cx="40" cy="50" rx="9" ry="12" />
        <ellipse transform="rotate(15 80 50)" cx="80" cy="50" rx="9" ry="12" />
        <ellipse transform="rotate(15 50 30)" cx="50" cy="30" rx="7" ry="10" />
        <ellipse transform="rotate(15 70 30)" cx="70" cy="30" rx="7" ry="10" />
      </g>
    </svg>
  )
}

export default LogoIcon


