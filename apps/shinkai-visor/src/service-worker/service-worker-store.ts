import { actions, store } from './store';
import { dispatch, useSelector } from './sw-store/app-side';

type StoreType = ReturnType<(typeof store.getState)>;

export const dispatchSw = <
  Action extends keyof typeof actions,
  ActionArguments extends Parameters<(typeof actions)[Action]>
>(
  action: Action,
  actionArguments: ActionArguments
) => {
  dispatch(action, actionArguments);
};


export const useSelectorSw = <SelectorReturnType>(
  selector: (
    store: StoreType,
  ) => SelectorReturnType | undefined
): SelectorReturnType | undefined => {
  return useSelector<StoreType, SelectorReturnType>(selector);
};
