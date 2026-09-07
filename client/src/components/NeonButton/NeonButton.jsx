import React, { useState } from 'react';
import NeonBorder from '../NeonBorder/NeonBorder';
import styles from './NeonButton.module.css';

export default function NeonButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  color,
  rounded = 50,
  thickness = 2.4,
  borderSize = 35,
  glow = 70,
  speed = 14,
  style = {},
  fullWidth = false,
  as = 'button',
  href,
  target,
  rel,
  id,
  title,
  'aria-label': ariaLabel,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine neon color based on variant if not explicitly provided
  const neonColor = color || (variant === 'primary' ? '#d4a857' : '#f5dfa6');

  const Component = as;

  return (
    <div
      className={`${styles.neonBtnContainer} ${fullWidth ? styles.fullWidth : ''}`}
      style={{
        borderRadius: rounded === 50 ? '999px' : `${rounded}px`,
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Neon Border Effect */}
      <div className={styles.neonOverlay}>
        <NeonBorder
          color={neonColor}
          rounded={rounded}
          thickness={thickness}
          borderSize={borderSize}
          glow={isHovered ? glow + 25 : glow}
          speed={isHovered ? speed * 1.35 : speed}
        />
      </div>

      {/* Button or Link Element */}
      <Component
        id={id}
        type={as === 'button' ? type : undefined}
        href={href}
        target={target}
        rel={rel}
        disabled={disabled}
        onClick={onClick}
        title={title}
        aria-label={ariaLabel}
        className={`${styles.baseBtn} ${styles[variant] || styles.primary} ${className}`}
      >
        {children}
        {/* Specular Light Sweep Effect on Hover */}
        <span className={styles.shineBeam} aria-hidden="true" />
      </Component>
    </div>
  );
}

