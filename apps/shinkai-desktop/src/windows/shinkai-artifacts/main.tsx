import './globals.css';

// import { NodePath } from '@babel/core';
import * as Babel from '@babel/standalone';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import ReactDOM from 'react-dom/client';

export const getReactComponentFromCode = (code: string) => {
  try {
    const transpiledCode = Babel.transform(code, {
      // presets: ['react'],
      presets: ['react', 'typescript'],
      filename: 'file.tsx',
      plugins: [importToVariablePlugin],
    }).code;

    const scope: any = {
      React: {
        ...React,
        useState: React.useState,
        useEffect: React.useEffect,
      },
    };

    const fullCode = `
          const exports = {};
          ${transpiledCode}
          return exports.default;
        `;

    const evalCode = new Function('scope', fullCode);
    const ComponentToRender = evalCode(scope);

    console.log(ComponentToRender, 'ComponentToRender');
    return ComponentToRender;
  } catch (error) {
    console.log(error);
  }
};
const importToVariablePlugin = ({ types: t }: any) => ({
  visitor: {
    ImportDeclaration(path: any) {
      const declarations = path.node.specifiers
        .map((specifier: any) => {
          if (t.isImportDefaultSpecifier(specifier)) {
            return t.variableDeclarator(
              specifier.local,
              t.memberExpression(
                t.identifier('scope'),
                t.identifier(specifier.local.name),
              ),
            );
          } else if (t.isImportSpecifier(specifier)) {
            if (path.node.source.value === 'react') {
              return t.variableDeclarator(
                specifier.local,
                t.memberExpression(
                  t.memberExpression(
                    t.identifier('scope'),
                    t.identifier('React'),
                  ),
                  specifier.imported,
                ),
              );
            } else {
              return t.variableDeclarator(
                specifier.local,
                t.memberExpression(t.identifier('scope'), specifier.imported),
              );
            }
          }
          return null;
        })
        .filter(Boolean);

      path.replaceWith(t.variableDeclaration('const', declarations));
    },
    ExportDefaultDeclaration(path: any) {
      path.replaceWith(
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(
              t.identifier('exports'),
              t.identifier('default'),
            ),
            path.node.declaration,
          ),
        ),
      );
    },
  },
});

const App = () => {
  const [code, setCode] = useState<string | null>(null);

  const [component, setComponent] = useState<React.ComponentType | null>(null);

  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (code) {
      try {
        const ComponentToRender = getReactComponentFromCode(code);
        if (ComponentToRender) {
          setComponent(() => ComponentToRender);
        } else {
          throw new Error(
            'No valid React component found in the provided code',
          );
        }
      } catch (error) {
        throw new Error('Error evaluating component code');
      }
    }
  }, [code]);

  useEffect(() => {
    window.parent.postMessage({ type: 'INIT_COMPLETE' }, '*');

    const handleMessage = (event: any) => {
      if (event?.data?.type === 'UPDATE_COMPONENT') {
        console.log('Received message', event.data);
        setCode(event?.data?.code ?? '');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="bg-white text-gray-500" ref={contentRef}>
      {component ? React.createElement(component) : <div>Loading...</div>}
    </div>
  );
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
