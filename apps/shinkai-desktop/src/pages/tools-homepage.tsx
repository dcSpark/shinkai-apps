import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  CodeLanguage,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useDisableAllTools } from '@shinkai_network/shinkai-node-state/v2/mutations/disableAllTools/useDisableAllTools';
import { useEnableAllTools } from '@shinkai_network/shinkai-node-state/v2/mutations/enableAllTools/useEnableAllTools';
import { useImportTool } from '@shinkai_network/shinkai-node-state/v2/mutations/importTool/useImportTool';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
import {
  Button,
  buttonVariants,
  ChatInputArea,
  Form,
  Skeleton,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import { useScrollRestoration } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { animate } from 'framer-motion';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, StoreIcon } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { LanguageToolSelector } from '../components/playground-tool/components/language-tool-selector';
import { ToolsSelection } from '../components/playground-tool/components/tools-selection';
import { usePlaygroundStore } from '../components/playground-tool/context/playground-context';
import { useCreateToolAndSave } from '../components/playground-tool/hooks/use-create-tool-and-save';
import { useToolForm } from '../components/playground-tool/hooks/use-tool-code';
import PlaygroundToolLayout from '../components/playground-tool/layout';
import {
  DockerStatus,
  ImportToolModal,
  ToolCollection,
} from '../components/tools/tool-collection';
import { VideoBanner } from '../components/video-banner';
import { TutorialBanner } from '../store/settings';
import { SHINKAI_TUTORIALS } from '../utils/constants';
import { SHINKAI_STORE_URL } from '../utils/store';

export const BackgroundBeams = React.memo(
  ({ className }: { className?: string }) => {
    const paths = [
      'M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875',
      'M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867',
      'M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859',
      'M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851',
      'M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843',
      'M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835',
      'M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827',
      'M-331 -245C-331 -245 -263 160 201 287C665 414 733 819 733 819',
      'M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811',
      'M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803',
      'M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795',
      'M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787',
      'M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779',
      'M-289 -293C-289 -293 -221 112 243 239C707 366 775 771 775 771',
      'M-282 -301C-282 -301 -214 104 250 231C714 358 782 763 782 763',
      'M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755',
      'M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747',
      'M-261 -325C-261 -325 -193 80 271 207C735 334 803 739 803 739',
      'M-254 -333C-254 -333 -186 72 278 199C742 326 810 731 810 731',
      'M-247 -341C-247 -341 -179 64 285 191C749 318 817 723 817 723',
      'M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715',
      'M-233 -357C-233 -357 -165 48 299 175C763 302 831 707 831 707',

      'M-226 -365C-226 -365 -158 40 306 167C770 294 838 699 838 699',
      'M-219 -373C-219 -373 -151 32 313 159C777 286 845 691 845 691',
      'M-212 -381C-212 -381 -144 24 320 151C784 278 852 683 852 683',
      'M-205 -389C-205 -389 -137 16 327 143C791 270 859 675 859 675',
      'M-198 -397C-198 -397 -130 8 334 135C798 262 866 667 866 667',
      'M-191 -405C-191 -405 -123 0 341 127C805 254 873 659 873 659',
      'M-184 -413C-184 -413 -116 -8 348 119C812 246 880 651 880 651',
      'M-177 -421C-177 -421 -109 -16 355 111C819 238 887 643 887 643',
      'M-170 -429C-170 -429 -102 -24 362 103C826 230 894 635 894 635',
      'M-163 -437C-163 -437 -95 -32 369 95C833 222 901 627 901 627',
      'M-156 -445C-156 -445 -88 -40 376 87C840 214 908 619 908 619',
      'M-149 -453C-149 -453 -81 -48 383 79C847 206 915 611 915 611',
      'M-142 -461C-142 -461 -74 -56 390 71C854 198 922 603 922 603',
      'M-135 -469C-135 -469 -67 -64 397 63C861 190 929 595 929 595',
      'M-128 -477C-128 -477 -60 -72 404 55C868 182 936 587 936 587',
      'M-121 -485C-121 -485 -53 -80 411 47C875 174 943 579 943 579',
      'M-114 -493C-114 -493 -46 -88 418 39C882 166 950 571 950 571',
      'M-107 -501C-107 -501 -39 -96 425 31C889 158 957 563 957 563',
      'M-100 -509C-100 -509 -32 -104 432 23C896 150 964 555 964 555',
      'M-93 -517C-93 -517 -25 -112 439 15C903 142 971 547 971 547',
      'M-86 -525C-86 -525 -18 -120 446 7C910 134 978 539 978 539',
      'M-79 -533C-79 -533 -11 -128 453 -1C917 126 985 531 985 531',
      'M-72 -541C-72 -541 -4 -136 460 -9C924 118 992 523 992 523',
      'M-65 -549C-65 -549 3 -144 467 -17C931 110 999 515 999 515',
      'M-58 -557C-58 -557 10 -152 474 -25C938 102 1006 507 1006 507',
      'M-51 -565C-51 -565 17 -160 481 -33C945 94 1013 499 1013 499',
      'M-44 -573C-44 -573 24 -168 488 -41C952 86 1020 491 1020 491',
      'M-37 -581C-37 -581 31 -176 495 -49C959 78 1027 483 1027 483',
    ];
    return (
      <div
        className={cn(
          'absolute inset-0 flex h-full w-full items-center justify-center [mask-repeat:no-repeat] [mask-size:40px]',
          className,
        )}
      >
        <svg
          className="pointer-events-none absolute z-0 h-full w-full"
          fill="none"
          height="100%"
          viewBox="0 0 696 316"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827M-331 -245C-331 -245 -263 160 201 287C665 414 733 819 733 819M-324 -253C-324 -253 -256 152 208 279C672 406 740 811 740 811M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803M-310 -269C-310 -269 -242 136 222 263C686 390 754 795 754 795M-303 -277C-303 -277 -235 128 229 255C693 382 761 787 761 787M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779M-289 -293C-289 -293 -221 112 243 239C707 366 775 771 775 771M-282 -301C-282 -301 -214 104 250 231C714 358 782 763 782 763M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755M-268 -317C-268 -317 -200 88 264 215C728 342 796 747 796 747M-261 -325C-261 -325 -193 80 271 207C735 334 803 739 803 739M-254 -333C-254 -333 -186 72 278 199C742 326 810 731 810 731M-247 -341C-247 -341 -179 64 285 191C749 318 817 723 817 723M-240 -349C-240 -349 -172 56 292 183C756 310 824 715 824 715M-233 -357C-233 -357 -165 48 299 175C763 302 831 707 831 707M-226 -365C-226 -365 -158 40 306 167C770 294 838 699 838 699M-219 -373C-219 -373 -151 32 313 159C777 286 845 691 845 691M-212 -381C-212 -381 -144 24 320 151C784 278 852 683 852 683M-205 -389C-205 -389 -137 16 327 143C791 270 859 675 859 675M-198 -397C-198 -397 -130 8 334 135C798 262 866 667 866 667M-191 -405C-191 -405 -123 0 341 127C805 254 873 659 873 659M-184 -413C-184 -413 -116 -8 348 119C812 246 880 651 880 651M-177 -421C-177 -421 -109 -16 355 111C819 238 887 643 887 643M-170 -429C-170 -429 -102 -24 362 103C826 230 894 635 894 635M-163 -437C-163 -437 -95 -32 369 95C833 222 901 627 901 627M-156 -445C-156 -445 -88 -40 376 87C840 214 908 619 908 619M-149 -453C-149 -453 -81 -48 383 79C847 206 915 611 915 611M-142 -461C-142 -461 -74 -56 390 71C854 198 922 603 922 603M-135 -469C-135 -469 -67 -64 397 63C861 190 929 595 929 595M-128 -477C-128 -477 -60 -72 404 55C868 182 936 587 936 587M-121 -485C-121 -485 -53 -80 411 47C875 174 943 579 943 579M-114 -493C-114 -493 -46 -88 418 39C882 166 950 571 950 571M-107 -501C-107 -501 -39 -96 425 31C889 158 957 563 957 563M-100 -509C-100 -509 -32 -104 432 23C896 150 964 555 964 555M-93 -517C-93 -517 -25 -112 439 15C903 142 971 547 971 547M-86 -525C-86 -525 -18 -120 446 7C910 134 978 539 978 539M-79 -533C-79 -533 -11 -128 453 -1C917 126 985 531 985 531M-72 -541C-72 -541 -4 -136 460 -9C924 118 992 523 992 523M-65 -549C-65 -549 3 -144 467 -17C931 110 999 515 999 515M-58 -557C-58 -557 10 -152 474 -25C938 102 1006 507 1006 507M-51 -565C-51 -565 17 -160 481 -33C945 94 1013 499 1013 499M-44 -573C-44 -573 24 -168 488 -41C952 86 1020 491 1020 491M-37 -581C-37 -581 31 -176 495 -49C959 78 1027 483 1027 483M-30 -589C-30 -589 38 -184 502 -57C966 70 1034 475 1034 475M-23 -597C-23 -597 45 -192 509 -65C973 62 1041 467 1041 467M-16 -605C-16 -605 52 -200 516 -73C980 54 1048 459 1048 459M-9 -613C-9 -613 59 -208 523 -81C987 46 1055 451 1055 451M-2 -621C-2 -621 66 -216 530 -89C994 38 1062 443 1062 443M5 -629C5 -629 73 -224 537 -97C1001 30 1069 435 1069 435M12 -637C12 -637 80 -232 544 -105C1008 22 1076 427 1076 427M19 -645C19 -645 87 -240 551 -113C1015 14 1083 419 1083 419"
            stroke="url(#paint0_radial_242_278)"
            strokeOpacity="0.05"
            strokeWidth="0.5"
          />

          {paths.map((path, index) => (
            <motion.path
              d={path}
              key={`path-` + index}
              stroke={`url(#linearGradient-${index})`}
              strokeOpacity="0.4"
              strokeWidth="0.5"
            />
          ))}
          <defs>
            {paths.map((path, index) => (
              <motion.linearGradient
                animate={{
                  x1: ['0%', '100%'],
                  x2: ['0%', '95%'],
                  y1: ['0%', '100%'],
                  y2: ['0%', `${93 + Math.random() * 8}%`],
                }}
                id={`linearGradient-${index}`}
                initial={{
                  x1: '0%',
                  x2: '0%',
                  y1: '0%',
                  y2: '0%',
                }}
                key={`gradient-${index}`}
                transition={{
                  duration: Math.random() * 10 + 10,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: Math.random() * 10,
                }}
              >
                <stop stopColor="#18CCFC" stopOpacity="0" />
                <stop stopColor="#18CCFC" />
                <stop offset="32.5%" stopColor="#6344F5" />
                <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
              </motion.linearGradient>
            ))}

            <radialGradient
              cx="0"
              cy="0"
              gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
              gradientUnits="userSpaceOnUse"
              id="paint0_radial_242_278"
              r="1"
            >
              <stop offset="0.0666667" stopColor="var(--neutral-300)" />
              <stop offset="0.243243" stopColor="var(--neutral-300)" />
              <stop offset="0.43594" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  },
);

BackgroundBeams.displayName = 'BackgroundBeams';

export const ToolsHomepage = () => {
  const { t } = useTranslation();
  const form = useToolForm();
  const toolHomepageScrollPositionRef = usePlaygroundStore(
    (state) => state.toolHomepageScrollPositionRef,
  );

  const scrollElementRef = useRef<HTMLDivElement>(null);
  useScrollRestoration({
    key: 'tools',
    containerRef: scrollElementRef,
    scrollTopStateRef: toolHomepageScrollPositionRef,
  });

  const { createToolAndSaveTool, isProcessing, isSuccess } =
    useCreateToolAndSave({
      form,
    });

  if (isProcessing) {
    return (
      <div className={cn('min-h-full flex-1 overflow-auto')}>
        <PlaygroundToolLayout
          leftElement={
            <div className="flex w-full flex-col gap-4 p-4">
              <Skeleton className="bg-official-gray-900 h-6 w-32" />
              <Skeleton className="bg-official-gray-900 h-24 w-full" />
              <Skeleton className="bg-official-gray-900 h-24 w-full" />
            </div>
          }
          rightElement={
            <div className="flex w-full flex-col gap-4 p-4">
              <Skeleton className="bg-official-gray-900 h-6 w-32" />
              <Skeleton className="bg-official-gray-900 h-[400px] w-full" />
            </div>
          }
          topElement={
            <div className="flex items-center justify-center p-4">
              <Skeleton className="bg-official-gray-900 h-8 w-48" />
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div
      className={cn('min-h-full flex-1 overflow-auto')}
      ref={scrollElementRef}
    >
      <div className="mx-auto max-w-4xl pb-[80px]">
        <div className="mb-[80px] flex items-center justify-end gap-3 px-0 py-4">
          <DockerStatus />
          <ImportToolModal />
          <Link
            className={cn(
              buttonVariants({
                size: 'xs',
                variant: 'outline',
                rounded: 'lg',
              }),
            )}
            rel="noreferrer"
            target="_blank"
            to={SHINKAI_STORE_URL}
          >
            <StoreIcon className="size-4" />
            Visit App Store
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-20">
            <div className="flex min-h-[300px] w-full flex-col items-center justify-between gap-10 pt-2">
              <div className="flex flex-col gap-2">
                <h1 className="font-clash text-center text-5xl font-semibold">
                  Build AI Tools in Minutes
                </h1>
                <p className="text-official-gray-400 text-center text-lg">
                  Create, automate, and optimize your workflow with powerful AI
                  tools.
                </p>
              </div>

              <div className="w-full max-w-3xl">
                <Form {...form}>
                  <form>
                    <ChatInputArea
                      autoFocus
                      bottomAddons={
                        <div className="flex items-end justify-between gap-3 pb-1 pl-1">
                          <div className="flex items-center gap-3">
                            <AIModelSelector
                              onValueChange={(value) => {
                                form.setValue('llmProviderId', value);
                              }}
                              value={form.watch('llmProviderId')}
                            />
                            <LanguageToolSelector
                              onValueChange={(value) => {
                                form.setValue(
                                  'language',
                                  value as CodeLanguage,
                                );
                              }}
                              value={form.watch('language')}
                            />
                            <ToolsSelection
                              onChange={(value) => {
                                form.setValue('tools', value);
                              }}
                              value={form.watch('tools')}
                            />
                          </div>

                          <Button
                            className={cn(
                              'hover:bg-app-gradient bg-official-gray-800 h-[40px] w-[40px] cursor-pointer rounded-xl p-3 transition-colors',
                              'disabled:text-gray-80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-300 hover:disabled:bg-gray-300',
                            )}
                            isLoading={isProcessing}
                            onClick={() =>
                              createToolAndSaveTool(form.getValues())
                            }
                            size="icon"
                            type="button"
                            variant="tertiary"
                          >
                            <SendIcon className="h-full w-full" />
                            <span className="sr-only">
                              {t('chat.sendMessage')}
                            </span>
                          </Button>
                        </div>
                      }
                      disabled={isProcessing}
                      onChange={(value) => {
                        form.setValue('message', value);
                      }}
                      onSubmit={form.handleSubmit(createToolAndSaveTool)}
                      placeholder={'Ask AI to create a tool for you...'}
                      textareaClassName="min-h-[90px]"
                      value={form.watch('message')}
                    />

                    <div className="flex w-full items-center justify-center gap-3 py-6">
                      {[
                        {
                          text: 'Download website as markdown',
                          prompt:
                            'Generate a tool for downloading a website into markdown',
                        },
                        {
                          text: 'Get Hacker News stories',
                          prompt:
                            'Generate a tool for getting top tech-related stories from Hacker News, include the title, author, and URL of the story',
                        },
                        {
                          text: 'Podcast summary',
                          prompt:
                            'Generate a tool for summarizing a podcast, include the title, author, and URL of the story',
                        },
                      ].map((suggestion) => (
                        <Button
                          key={suggestion.text}
                          onClick={() =>
                            form.setValue('message', suggestion.prompt)
                          }
                          size="xs"
                          type="button"
                          variant="outline"
                        >
                          {suggestion.text}
                          <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      ))}
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            <VideoBanner
              name={TutorialBanner.SHINKAI_TOOLS}
              title="Welcome to the Shinkai Tools"
              videoUrl={SHINKAI_TUTORIALS['shinkai-tools']}
            />

            <ToolCollection />

            <div className="bg-official-gray-1100 relative rounded-lg">
              <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-8 p-10 text-center">
                <div className="flex flex-col gap-2">
                  <h3 className="font-clash max-w-xl text-2xl font-semibold tracking-normal">
                    Discover More Tools
                  </h3>
                  <p className="text-official-gray-400 max-w-xl text-base leading-relaxed tracking-tight">
                    Explore and install tools from our App Store to boost your
                    productivity and automate your workflow.
                  </p>
                </div>
                <div className="isolate flex flex-row gap-4">
                  <a
                    className={cn(buttonVariants({ size: 'sm' }), 'gap-4 px-4')}
                    href={SHINKAI_STORE_URL}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Visit App Store <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <BackgroundBeams />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
