import { Primitive } from '@radix-ui/react-primitive';
import { useCallbackRef } from '@radix-ui/react-use-callback-ref';
import React, {
  ComponentPropsWithoutRef,
  ComponentType,
  createContext,
  ElementRef,
  ElementType,
  FC,
  forwardRef,
  ForwardRefExoticComponent,
  memo,
  ReactNode,
  RefAttributes,
  useContext,
  useMemo,
} from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import {
  PrismAsyncLight,
  SyntaxHighlighterProps as SHP,
} from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import { default as github } from 'react-syntax-highlighter/dist/esm/styles/hljs/github';
// import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { cn } from '../utils';
import { CopyToClipboardIcon } from './copy-to-clipboard-icon';

type CodeHeaderProps = {
  language: string | undefined;
  code: string;
};
export const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  return (
    <div className="code-header-root flex items-center justify-between gap-4 rounded-t-lg border-b border-gray-400 bg-[#0d1117] px-4 py-1 text-white">
      <span className="code-header-language text-gray-80 text-xs font-medium lowercase">
        {language}
      </span>
      <CopyToClipboardIcon
        className={cn(
          'text-gray-80 h-7 w-7 bg-transparent hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
        )}
        string={code}
      />
    </div>
  );
};

const makeMakeSyntaxHighlighter =
  (SyntaxHighlighter: ComponentType<SHP>) =>
  (config: Omit<SHP, 'language' | 'children'>) => {
    const PrismSyntaxHighlighter: FC<SyntaxHighlighterProps> = ({
      components: { Pre, Code },
      language,
      code,
    }) => {
      return (
        <SyntaxHighlighter
          CodeTag={Code}
          PreTag={Pre}
          {...config}
          language={language}
        >
          {code}
        </SyntaxHighlighter>
      );
    };

    PrismSyntaxHighlighter.displayName = 'PrismSyntaxHighlighter';

    return PrismSyntaxHighlighter;
  };

// register languages you want to support
PrismAsyncLight.registerLanguage('js', tsx);
PrismAsyncLight.registerLanguage('jsx', tsx);
PrismAsyncLight.registerLanguage('ts', tsx);
PrismAsyncLight.registerLanguage('tsx', tsx);
PrismAsyncLight.registerLanguage('python', python);

export const makePrismAsyncLightSyntaxHighlighter =
  makeMakeSyntaxHighlighter(PrismAsyncLight);

export const SyntaxHighlighterBase = makePrismAsyncLightSyntaxHighlighter({
  style: github,
  customStyle: {
    margin: 0,
    width: '100%',
    background: '#0d1117',
    padding: '1.5rem 1rem',
    fontSize: '0.75rem',
  },
});

export const defaultComponents: MarkdownTextPrimitiveProps['components'] = {
  h1: ({ node, className, ...props }) => (
    <h1
      className={cn(
        'mb-3.5 scroll-m-20 text-[1.203125rem] font-extrabold leading-[1.5] last:mb-0',
        className,
      )}
      {...props}
    />
  ),
  h2: ({ node, className, ...props }) => (
    <h2
      className={cn(
        'mb-3.5 mt-5 scroll-m-20 text-[1.09375rem] font-semibold leading-[1.25] first:mt-0 last:mb-0',
        className,
      )}
      {...props}
    />
  ),
  h3: ({ node, className, ...props }) => (
    <h3
      className={cn(
        'mb-2 mt-4 scroll-m-20 text-base font-semibold leading-[1.25] first:mt-0 last:mb-0',
        className,
      )}
      {...props}
    />
  ),
  h4: ({ node, className, ...props }) => (
    <h4
      className={cn(
        'mb-2 mt-4 scroll-m-20 text-base font-semibold leading-[1.25] first:mt-0 last:mb-0',
        className,
      )}
      {...props}
    />
  ),
  h5: ({ node, className, ...props }) => (
    <h5
      className={cn(
        'my-2 text-base font-semibold first:mt-0 last:mb-0',
        className,
      )}
      {...props}
    />
  ),
  h6: ({ node, className, ...props }) => (
    <h6
      className={cn('my-2 font-semibold first:mt-0 last:mb-0', className)}
      {...props}
    />
  ),
  p: ({ node, className, ...props }) => (
    <p
      className={cn('mb-5 mt-5 text-sm first:mt-0 last:mb-0', className)}
      {...props}
    />
  ),
  a: ({ node, className, ...props }) => (
    <a
      className={cn(
        'font-medium text-blue-400 underline underline-offset-4',
        className,
      )}
      target="_blank"
      {...props}
    />
  ),
  blockquote: ({ node, className, ...props }) => (
    <blockquote
      className={cn('border-l-2 pl-6 italic', className)}
      {...props}
    />
  ),
  ul: ({ node, className, ...props }) => (
    <ul
      className={cn('my-4 ml-6 list-disc [&>li]:mt-2', className)}
      {...props}
    />
  ),
  ol: ({ node, className, ...props }) => (
    <ol
      className={cn('my-4 ml-6 list-decimal [&>li]:mt-2', className)}
      {...props}
    />
  ),
  hr: ({ node, className, ...props }) => (
    <hr className={cn('my-2.5 border-b', className)} {...props} />
  ),
  table: ({ node, className, ...props }) => (
    <div className="my-3 size-full overflow-x-auto">
      <table className="w-full border-collapse border-spacing-0" {...props} />
    </div>
  ),
  thead: ({ node, className, ...props }) => (
    <thead className={cn('[&>tr]:border-none', className)} {...props} />
  ),
  th: ({ node, className, ...props }) => (
    <th
      className={cn(
        'bg-[#161b22] px-4 py-2 text-left text-xs font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  ),
  td: ({ node, className, ...props }) => (
    <td
      className={cn(
        'border-b border-l border-[#30363d] px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  ),
  tr: ({ node, className, ...props }) => (
    <tr
      className={cn(
        'm-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg [&:nth-child(2n)]:bg-[#30363d]',
        className,
      )}
      {...props}
    />
  ),
  sup: ({ node, className, ...props }) => (
    <sup
      className={cn('[&>a]:text-xs [&>a]:no-underline', className)}
      {...props}
    />
  ),
  pre: ({ node, className, ...props }) => (
    <pre
      className={cn(
        'overflow-x-auto rounded-b-lg bg-black !px-4 !py-3 text-white',
        className,
      )}
      {...props}
    />
  ),
  code: function Code({ node, className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={cn(
          !isCodeBlock && 'rounded border bg-gray-300 font-semibold',
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader,
  SyntaxHighlighter: SyntaxHighlighterBase,
};

export type PreComponent = NonNullable<
  NonNullable<Options['components']>['pre']
>;

export const PreContext = createContext<Omit<
  ComponentPropsWithoutRef<PreComponent>,
  'children'
> | null>(null);

export const useIsMarkdownCodeBlock = () => {
  return useContext(PreContext) !== null;
};

export const PreOverride: PreComponent = ({ children, ...rest }) => {
  return <PreContext.Provider value={rest}>{children}</PreContext.Provider>;
};

export type CodeComponent = NonNullable<
  NonNullable<Options['components']>['code']
>;

export const DefaultPre: PreComponent = ({ node, ...rest }) => (
  <pre {...rest} />
);

export const DefaultCode: CodeComponent = ({ node, ...rest }) => (
  <code {...rest} />
);

export const DefaultCodeBlockContent: ComponentType<{
  components: { Pre: PreComponent; Code: CodeComponent };
  code: string | ReactNode | undefined;
}> = ({ components: { Pre, Code }, code }) => (
  <Pre>
    <Code>{code}</Code>
  </Pre>
);

export const DefaultCodeHeader: ComponentType<CodeHeaderProps> = () => null;

type MarkdownTextPrimitiveElement = ElementRef<typeof Primitive.div>;
type PrimitiveDivProps = ComponentPropsWithoutRef<typeof Primitive.div>;

export type MarkdownTextPrimitiveProps = Omit<
  Options,
  'components' | 'children'
> & {
  containerProps?: Omit<PrimitiveDivProps, 'children' | 'asChild'>;
  containerComponent?: ElementType;
  components?: NonNullable<Options['components']> & {
    SyntaxHighlighter?: ComponentType<SyntaxHighlighterProps>;
    CodeHeader?: ComponentType<CodeHeaderProps>;
    by_language?: Record<
      string,
      {
        CodeHeader?: ComponentType<CodeHeaderProps>;
        SyntaxHighlighter?: ComponentType<SyntaxHighlighterProps>;
      }
    >;
  };
  content: string;
};

export type CodeOverrideProps = ComponentPropsWithoutRef<CodeComponent> & {
  components: {
    Pre: PreComponent;
    Code: CodeComponent;
    CodeHeader: ComponentType<CodeHeaderProps>;
    SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
    by_language?: Record<
      string,
      {
        CodeHeader?: ComponentType<CodeHeaderProps>;
        SyntaxHighlighter?: ComponentType<SyntaxHighlighterProps>;
      }
    >;
  };
};

export type SyntaxHighlighterProps = {
  components: {
    Pre: PreComponent;
    Code: CodeComponent;
  };
  language: string;
  code: string;
};

export type CodeBlockProps = {
  language: string;
  code: string;
  components: {
    Pre: PreComponent;
    Code: CodeComponent;
    CodeHeader: ComponentType<CodeHeaderProps>;
    SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  };
};

export const DefaultCodeBlock: FC<CodeBlockProps> = ({
  components: { Pre, Code, SyntaxHighlighter, CodeHeader },
  language,
  code,
}) => {
  const components = useMemo(() => ({ Pre, Code }), [Pre, Code]);

  const SH = language ? SyntaxHighlighter : DefaultCodeBlockContent;

  return (
    <>
      <CodeHeader code={code} language={language} />
      <SH
        code={code}
        components={components}
        language={language ?? 'unknown'}
      />
    </>
  );
};

export const withDefaultProps =
  <TProps extends { className?: string | undefined }>({
    className,
    ...defaultProps
  }: Partial<TProps>) =>
  ({ className: classNameProp, ...props }: TProps) => {
    return {
      className: cn(className, classNameProp),
      ...defaultProps,
      ...props,
    } as TProps;
  };

const CodeBlockOverride: FC<CodeOverrideProps> = ({
  components: {
    Pre,
    Code,
    SyntaxHighlighter: FallbackSyntaxHighlighter,
    CodeHeader: FallbackCodeHeader,
    by_language = {},
  },
  children,
  ...codeProps
}) => {
  const preProps = useContext(PreContext)!;
  const getPreProps = withDefaultProps<any>(preProps);
  const WrappedPre: PreComponent = useCallbackRef((props) => (
    <Pre {...getPreProps(props)} />
  ));

  const getCodeProps = withDefaultProps<any>(codeProps);
  const WrappedCode: CodeComponent = useCallbackRef((props) => (
    <Code {...getCodeProps(props)} />
  ));

  const language = /language-(\w+)/.exec(codeProps.className || '')?.[1] ?? '';

  // if the code content is not string (due to rehype plugins), return a default code block
  if (typeof children !== 'string') {
    return (
      <DefaultCodeBlockContent
        code={children}
        components={{ Pre: WrappedPre, Code: WrappedCode }}
      />
    );
  }

  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps> =
    by_language[language]?.SyntaxHighlighter ?? FallbackSyntaxHighlighter;

  const CodeHeader: ComponentType<CodeHeaderProps> =
    by_language[language]?.CodeHeader ?? FallbackCodeHeader;

  return (
    <DefaultCodeBlock
      code={children}
      components={{
        Pre: WrappedPre,
        Code: WrappedCode,
        SyntaxHighlighter,
        CodeHeader,
      }}
      language={language || 'unknown'}
    />
  );
};

export const CodeOverride: FC<CodeOverrideProps> = ({
  components,
  ...props
}) => {
  const preProps = useContext(PreContext);
  if (!preProps) return <components.Code {...(props as any)} />;
  return <CodeBlockOverride components={components} {...props} />;
};

export const MarkdownTextPrimitive: ForwardRefExoticComponent<MarkdownTextPrimitiveProps> &
  RefAttributes<MarkdownTextPrimitiveElement> = forwardRef<
  MarkdownTextPrimitiveElement,
  MarkdownTextPrimitiveProps
>(
  (
    {
      components: userComponents,
      className,
      containerProps,
      containerComponent: Container = 'div',
      content,
      ...rest
    },
    forwardedRef,
  ) => {
    const {
      pre = DefaultPre,
      code = DefaultCode,
      SyntaxHighlighter = DefaultCodeBlockContent,
      CodeHeader = DefaultCodeHeader,
      by_language,
      ...componentsRest
    } = userComponents ?? {};

    const components: typeof userComponents = {
      ...componentsRest,
      pre: PreOverride,
      code: useCallbackRef((props) => (
        <CodeOverride
          components={{
            Pre: pre,
            Code: code,
            SyntaxHighlighter,
            CodeHeader,
            by_language,
          }}
          {...props}
        />
      )),
    };

    return (
      <Container
        // data-status={status.type}
        {...containerProps}
        className={cn(className, containerProps?.className)}
        ref={forwardedRef}
      >
        <ReactMarkdown components={components} {...rest}>
          {content}
        </ReactMarkdown>
      </Container>
    );
  },
);

MarkdownTextPrimitive.displayName = 'MarkdownTextPrimitive';

export type MakeMarkdownTextProps = MarkdownTextPrimitiveProps & {
  isRunning?: boolean;
};

export const MarkdownTextBase = ({
  className,
  isRunning,
  components: userComponents,
  ...rest
}: MakeMarkdownTextProps) => {
  const components = {
    ...defaultComponents,
    ...Object.fromEntries(
      Object.entries(userComponents ?? {}).filter(([_, v]) => v !== undefined),
    ),
  };

  return (
    <MarkdownTextPrimitive
      components={components}
      remarkPlugins={[remarkGfm]}
      {...rest}
      className={cn(isRunning && 'md-running')}
      // rehypePlugins={[rehypeRaw]} // enable when needed to render raw html
    />
  );
};
export const MarkdownText = memo(
  MarkdownTextBase,
  (prev, next) =>
    prev.content === next.content && prev.isRunning === next.isRunning,
);
