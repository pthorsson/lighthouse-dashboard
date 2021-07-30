import React from 'react';
import { useParams } from 'react-router-dom';
import { LighthouseProvider, useApi, API_STATE } from '@hooks';
import ErrorScreen from '@components/error-screen';

const SectionVerifier: React.FC = ({ children }) => {
  const { section } = useParams<{ section: string }>();
  const { data, state } = useApi<Lhd.Section[]>('/api/sections', {
    runOnMount: true,
  });

  return state === API_STATE.SUCCESS ? (
    data?.find(({ slug }) => slug === section) ? (
      <LighthouseProvider section={section}>{children}</LighthouseProvider>
    ) : (
      <ErrorScreen
        header="Not found"
        message="A section with that name doesn't exist"
        link={{
          href: '/',
          text: 'Back to landing page',
        }}
      />
    )
  ) : null;
};

export default SectionVerifier;
