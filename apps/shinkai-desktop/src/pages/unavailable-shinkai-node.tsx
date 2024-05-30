import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import { Button } from '@shinkai_network/shinkai-ui';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../store/auth';
import OnboardingLayout from './layout/onboarding-layout';

const UnavailableShinkaiNodePage = () => {
  const navigate = useNavigate();
  const auth = useAuth((state) => state.auth);
  const { isSuccess: isGetShinkaiNodeHealthSuccess } = useGetHealth(
    {
      node_address: auth?.node_address ?? '',
    },
    { refetchInterval: 5000, enabled: !!auth },
  );

  useEffect(() => {
    if (isGetShinkaiNodeHealthSuccess) {
      navigate('/inboxes');
    }
  }, [isGetShinkaiNodeHealthSuccess, navigate]);

  return (
    <OnboardingLayout>
      <div className="flex h-full flex-col justify-between">
        <p className="text-4xl font-semibold leading-[1.5] tracking-wide">
          Your Shinkai Node is unavailable <span aria-hidden> 🔕</span>
        </p>
        <div className="">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col space-y-3">
              <Button variant={'default'}>Start it locally</Button>

              <Button variant={'default'}>Disconnect</Button>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default UnavailableShinkaiNodePage;
