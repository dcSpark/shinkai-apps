import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

export const AnimatedRoute = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="h-full w-full"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};
