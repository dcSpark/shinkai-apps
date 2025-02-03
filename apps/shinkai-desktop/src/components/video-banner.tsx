import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shinkai_network/shinkai-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

import { TutorialBanner } from '../store/settings';
import { useSettings } from '../store/settings';

interface VideoBannerProps {
  onClose?: () => void;
  title: string;
  description: string;
  docsUrl: string;
  name: TutorialBanner;
}

export function VideoBanner({
  title,
  description,
  docsUrl,
  name,
}: VideoBannerProps) {
  const [isVideoDialogOpen, setIsVideoDialogOpen] = React.useState(false);

  const dismissedTutorialBanners = useSettings(
    (state) => state.dismissedTutorialBanners,
  );

  const dismissTutorialBanner = useSettings(
    (state) => state.dismissTutorialBanner,
  );

  const isDismissed = dismissedTutorialBanners.includes(name);

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 mt-2 w-full rounded-lg bg-gray-600 backdrop-blur"
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="container flex flex-col gap-4 p-6">
            <Button
              className="absolute right-4 top-4 bg-transparent"
              onClick={() => dismissTutorialBanner(name)}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-6">
              <motion.div
                className="w relative aspect-video basis-[33%] cursor-pointer overflow-hidden rounded-lg bg-black"
                onClick={() => setIsVideoDialogOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <video
                  className="h-full w-full"
                  controls
                  src="/path-to-your-video.mp4"
                >
                  Your browser does not support the video tag.
                </video>
              </motion.div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                  <p className="text-gray-80 text-sm">{description}</p>
                </div>
                <motion.div whileHover={{ x: 2 }} whileTap={{ x: -1 }}>
                  <Button
                    className="h-auto p-0 text-sm underline"
                    onClick={() => setIsVideoDialogOpen(true)}
                    variant="link"
                  >
                    Watch Tutorial
                  </Button>
                </motion.div>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 text-sm">
              <motion.div
                className="w-full"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  className="flex h-auto w-full items-center gap-1"
                  onClick={() => window.open(docsUrl, '_blank')}
                  rounded="lg"
                  size="sm"
                  variant="outline"
                >
                  See Docs
                  <svg
                    fill="none"
                    height="12"
                    viewBox="0 0 15 15"
                    width="12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.7761 3 12 3.22386 12 3.5L12 9C12 9.27614 11.7761 9.5 11.5 9.5C11.2239 9.5 11 9.27614 11 9L11 4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    />
                  </svg>
                </Button>
              </motion.div>
            </div>
          </div>

          <Dialog onOpenChange={setIsVideoDialogOpen} open={isVideoDialogOpen}>
            <DialogContent className="bg-gray-600 sm:max-w-[85vw]">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <video
                  className="h-full w-full"
                  controls
                  src="/path-to-your-video.mp4"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
