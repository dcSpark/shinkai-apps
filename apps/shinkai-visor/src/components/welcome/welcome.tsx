import logo from '../../../src/assets/icons/shinkai-min.svg';
import { useHistory } from 'react-router';
import { motion } from 'framer-motion';
import { FormattedMessage } from 'react-intl';

export default function Welcome() {
  const history = useHistory();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full"
    >
      <div className="h-full flex flex-col justify-between">
        <div className="flex flex-grow flex-col space-y-5 place-content-center">
          <p className="text-lg" data-cy="welcome-message">
            <FormattedMessage id="welcome" />
          </p>
          <div className="grid place-content-center">
            <img
              src={logo}
              alt="shinkai logo"
              className="animate-spin-slow h-20 w-20"
            />
          </div>
        </div>
        <button
          onClick={() => history.push('/nodes/add')}
          className="shinkai-button"
        >
          <FormattedMessage id="setup" />
        </button>
      </div>
    </motion.div>
  );
}
