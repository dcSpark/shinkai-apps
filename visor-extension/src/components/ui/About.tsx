import * as React from 'react';
import { motion } from 'framer-motion';
import './about.css';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="about-container"
    >
      <h1 className="shinkai-name"> Shinkai Visor</h1>
      <div className="about-version">
        <p>Version: 0.4.2</p>
      </div>
      <div className="about-description">
        <p>
          Shinkai Visor is a chrome extension which unlocks the full capabilities/automation of
          first-class LLM (AI) support in the web browser.
        </p>
      </div>
      <div className="about-created-by">
        <a href="https://dcspark.io" rel="noopener noreferrer" target="_blank">
          <img src="/dcsparklogo.png" alt="" className="about-dcspark-logo" />
        </a>
      </div>
    </motion.div>
  );
}
