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
  ReactNode,
  RefAttributes,
  useContext,
  useMemo,
} from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import { Components } from 'react-markdown/lib';
import SyntaxHighlighter, {
  Light,
  LightAsync,
  Prism,
  PrismAsync,
  PrismAsyncLight,
  PrismLight,
  SyntaxHighlighterProps as SHP,
  SyntaxHighlighterProps,
} from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import { default as github } from 'react-syntax-highlighter/dist/esm/styles/hljs/github';
import rehypeRaw from 'rehype-raw';
import rehypeRewrite, { RehypeRewriteOptions } from 'rehype-rewrite';
import { PluggableList } from 'unified';

import { cn } from '../utils';
import { CopyToClipboardIcon } from './copy-to-clipboard-icon';

const rehypePlugins: PluggableList = [
  rehypeRaw,
  // rehypeRewrite,
  // {
  //   rewrite: (node, _, parent) => {
  //     if (
  //       node.type === 'element' &&
  //       node.tagName === 'a' &&
  //       parent &&
  //       parent.type === 'element' &&
  //       /^h([123456])/.test(parent.tagName)
  //     ) {
  //       parent.children = [parent.children[1]];
  //     }
  //   },
  // } as RehypeRewriteOptions,
];
type CodeHeaderProps = {
  language: string | undefined;
  code: string;
};
export const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  return (
    <div className="code-header-root flex items-center justify-between gap-4 rounded-t-lg bg-zinc-800 px-4 py-2 text-sm text-white">
      <span className="code-header-language text-gray-80 text-sm font-medium lowercase">
        {language}
      </span>
      <CopyToClipboardIcon
        className={cn(
          'text-gray-80 h-7 w-7 border border-gray-200 bg-transparent hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
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
      className={cn('mb-5 mt-5 leading-5 first:mt-0 last:mb-0', className)}
      {...props}
    />
  ),
  a: ({ node, className, ...props }) => (
    <a
      className={cn(
        'text-primary font-medium underline underline-offset-4',
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
    <div className="my-2.5 size-full overflow-x-auto">
      <table className="w-full" {...props} />
    </div>
    // <table
    //   className={cn(
    //     'my-5 w-full border-separate border-spacing-0 overflow-y-auto',
    //     className,
    //   )}
    //   {...props}
    // />
  ),
  th: ({ node, className, ...props }) => (
    <th
      className={cn(
        'bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  ),
  td: ({ node, className, ...props }) => (
    <td
      className={cn(
        'border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right',
        className,
      )}
      {...props}
    />
  ),
  tr: ({ node, className, ...props }) => (
    <tr
      className={cn(
        'm-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg',
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
        'overflow-x-auto rounded-b-lg bg-black p-4 text-white',
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
          !isCodeBlock && 'rounded border bg-gray-200 font-semibold',
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader,
  SyntaxHighlighter: SyntaxHighlighterBase,
};

export const MarkdownPreview = ({
  className,
  source,
  components,
}: {
  className?: string;
  source?: string;
  components?: Components;
}) => {
  return (
    <ReactMarkdown
      className={cn(
        // 'wmde-markdown-var',
        // 'max-w-none text-white',
        // 'prose prose-gray',
        // 'prose-h1:!text-[1.203125rem] prose-h1:!leading-[1.5] prose-h1:!my-3.5 prose-h1:!font-bold',
        // 'prose-h2:!text-[1.09375rem] prose-h2:!leading-[1.25] prose-h2:!my-3.5 prose-h2:!font-bold',
        // 'prose-h3:!text-base prose-h3:!leading-[1.25] prose-h3:!my-3.5 prose-h3:!font-bold',
        // 'prose-code:text-white prose-blockquote:text-gray-50 prose-blockquote:bg-gray-200 prose-strong:text-white prose-headings:text-white prose-p:whitespace-pre-wrap',
        // 'prose-code:before:hidden prose-code:after:hidden',
        // 'prose-h1:!border-b-0 prose-h2:!border-b-0 prose-h3:!border-b-0 prose-h4:!border-b-0 prose-h5:!border-b-0 prose-h6:!border-b-0',
        // 'prose-hr:!border-b-0 prose-hr:!h-[2px] prose-hr:!bg-gray-50/80',
        className,
      )}
      components={{
        // a: ({ node, ...props }) => (
        //   // eslint-disable-next-line jsx-a11y/anchor-has-content
        //   <a {...props} target="_blank" />
        // ),
        // table: ({ node, ...props }) => (
        //   <div className="mb-2 size-full overflow-x-auto">
        //     <table className="w-full" {...props} />
        //   </div>
        // ),
        ...defaultComponents,
      }}
      rehypePlugins={rehypePlugins}
      // rehypeRewrite={(node, _, parent) => {
      //   if (
      //     'tagName' in node &&
      //     node.tagName &&
      //     parent &&
      //     'tagName' in parent &&
      //     parent.tagName
      //   ) {
      //     if (node.tagName === 'a' && /^h([1-6])/.test(parent.tagName)) {
      //       // eslint-disable-next-line no-param-reassign
      //       parent.children = parent.children.slice(1);
      //     }
      //   }
      // }}

      // wrapperElement={{ 'data-color-mode': 'dark' }}
    >
      {source}
    </ReactMarkdown>
  );
};

//
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

// /

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
  smooth?: boolean;
  text: string;
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
      components: userComponents = defaultComponents,
      className,
      containerProps,
      containerComponent: Container = 'div',
      text,
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
          {text}
        </ReactMarkdown>
      </Container>
    );
  },
);

MarkdownTextPrimitive.displayName = 'MarkdownTextPrimitive';
