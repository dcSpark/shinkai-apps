import { Button } from 'antd';
import { motion } from 'framer-motion';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

import logo from '../../../src/assets/icons/shinkai-min.svg';

export default function Welcome() {
  const history = useHistory();
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="h-full"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <div className="h-full flex flex-col justify-between">
        <div className="flex flex-grow flex-col space-y-5 place-content-center">
          <p className="text-lg" data-cy="welcome-message">
            <FormattedMessage id="welcome" />
          </p>
          <div className="grid place-content-center">
            <img
              alt="shinkai logo"
              className="animate-spin-slow h-20 w-20"
              src={logo}
            />
          </div>
        </div>

        <Button
          onClick={() => history.push('/nodes/add')}
          type="primary"
        >
          <FormattedMessage id="setup" />
        </Button>
      </div>
    </motion.div>
  );
}
