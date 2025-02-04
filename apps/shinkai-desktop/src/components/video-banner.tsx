import {
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

import { TutorialBanner } from '../store/settings';
import { useSettings } from '../store/settings';

interface VideoBannerProps {
  onClose?: () => void;
  title: string;
  description?: string;
  docsUrl?: string;
  name: TutorialBanner;
  videoUrl: string;
}
export const SHINKAI_DOCS_URL = 'https://docs.shinkai.com';
export function VideoBanner({
  title,
  description = "Watch this tutorial to learn how it works. If you're already familiar with this feature, you can dismiss this video",
  docsUrl = SHINKAI_DOCS_URL,
  name,
  videoUrl,
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
          className="relative mb-4 mt-2 w-full rounded-lg bg-gray-600 backdrop-blur"
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
                <div className="relative h-full w-full">
                  <img
                    alt="Video thumbnail"
                    className="h-full w-full object-cover"
                    src={'/video-portrait.png'}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gray-450/80 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110">
                      <svg
                        fill={'none'}
                        height={24}
                        viewBox="0 0 24 24"
                        width={24}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
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
                <a
                  className={cn(
                    buttonVariants({
                      variant: 'outline',
                      size: 'sm',
                      rounded: 'lg',
                    }),
                    'flex h-auto w-full items-center gap-1 hover:bg-gray-500',
                  )}
                  href={docsUrl}
                  rel="noreferrer"
                  target="_blank"
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
                </a>
              </motion.div>
            </div>
          </div>

          <Dialog onOpenChange={setIsVideoDialogOpen} open={isVideoDialogOpen}>
            <DialogContent className="bg-gray-600 sm:max-w-[85vw]">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <video className="h-full w-full" controls src={videoUrl}>
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
