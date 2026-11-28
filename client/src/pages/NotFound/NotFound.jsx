import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import { sanitizeValidInvitationSearch } from '../../utils/invitationCodec';
import styles from './NotFound.module.css';

export default function NotFound() {
  const { search } = useLocation();
  const { t, language, isGroomSide } = useLanguage();
  const { title, description, backHome } = t.notFound;
  const query = sanitizeValidInvitationSearch(search, weddingConfig.playlist, language);
  const invitationPath = isGroomSide ? '/chu-re' : '/';

  return (
    <main id="invitation-not-found" className={styles.page} aria-labelledby="not-found-heading">
      <picture className={styles.art} aria-hidden="true">
        <source
          media="(min-width: 720px) and (min-aspect-ratio: 6/5)"
          srcSet="/mauve-theme/not-found-landscape.webp"
        />
        <img
          src="/mauve-theme/not-found-portrait.webp"
          alt=""
          fetchPriority="high"
          width="941"
          height="1672"
        />
      </picture>

      <div className={styles.content}>
        <h1 id="not-found-heading" className={styles.heading}>
          <span className={styles.code}>404</span>{' '}
          <span className={styles.title}>{title}</span>
        </h1>

        <div className={styles.divider} aria-hidden="true">
          <span className={styles.rings} />
        </div>

        <p className={styles.description}>{description}</p>

        <Link
          className={styles.backLink}
          to={{ pathname: invitationPath, search: query ? `?${query}` : '' }}
        >
          {backHome}
        </Link>
      </div>
    </main>
  );
}
