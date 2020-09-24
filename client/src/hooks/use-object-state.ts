import { useState } from 'react';

type ObjectState<T> = [T, (data: Partial<T>) => void];

export const useObjectState = <T>(initialState: T): ObjectState<T> => {
  const [state, setState] = useState<T>(initialState);

  return [state, data => setState({ ...state, ...data })];
};
