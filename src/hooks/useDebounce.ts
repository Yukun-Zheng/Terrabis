import { useState, useEffect } from 'react';

/**
 * 自定义防抖钩子，用于延迟处理用户输入
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置延迟更新防抖值的定时器
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 如果值在延迟期间变化，清除之前的定时器并重新开始
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // 只有当value或delay变化时重新运行effect

  return debouncedValue;
}

export default useDebounce; 