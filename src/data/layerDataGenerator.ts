import { GeoJSONSource } from 'mapbox-gl';

export interface GeoData {
  id: string;
  name: string;
  properties: {
    [key: string]: any;
  };
}

export interface LayerData {
  data: { label: string; value: number; color?: string }[];
  maxValue: number;
}

// 生成随机整数
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 为给定的GeoJSON特性生成随机人口数据
export const generatePopulationData = (features: any[]): LayerData => {
  if (!features || features.length === 0) {
    return { data: [], maxValue: 0 };
  }

  const data = features.map((feature) => {
    // 生成100万到5000万之间的随机人口数
    const value = getRandomInt(100, 5000) * 10000;
    const name = feature.properties.name || feature.id || '未知区域';
    return {
      label: name,
      value,
      // 根据人口数量设定不同的颜色
      color: value > 3000 * 10000 ? '#1a73e8' : value > 1500 * 10000 ? '#4285f4' : '#7baaf7',
    };
  });

  // 查找最大值
  const maxValue = Math.max(...data.map(item => item.value));

  return {
    data,
    maxValue,
  };
};

// 为给定的GeoJSON特性生成随机GDP数据
export const generateGDPData = (features: any[]): LayerData => {
  if (!features || features.length === 0) {
    return { data: [], maxValue: 0 };
  }

  const data = features.map((feature) => {
    // 生成100亿到20000亿之间的随机GDP
    const value = getRandomInt(100, 20000);
    const name = feature.properties.name || feature.id || '未知区域';
    return {
      label: name,
      value,
      // 根据GDP设定不同的颜色
      color: value > 10000 ? '#0f9d58' : value > 5000 ? '#34a853' : '#66bb6a',
    };
  });

  // 查找最大值
  const maxValue = Math.max(...data.map(item => item.value));

  return {
    data,
    maxValue,
  };
};

// 为给定的GeoJSON特性生成随机城市化率数据
export const generateUrbanizationData = (features: any[]): LayerData => {
  if (!features || features.length === 0) {
    return { data: [], maxValue: 0 };
  }

  const data = features.map((feature) => {
    // 生成20%到90%之间的随机城市化率
    const value = getRandomInt(20, 90);
    const name = feature.properties.name || feature.id || '未知区域';
    return {
      label: name,
      value,
      // 根据城市化率设定不同的颜色
      color: value > 70 ? '#db4437' : value > 50 ? '#ea4335' : '#f44336',
    };
  });

  // 查找最大值
  const maxValue = Math.max(...data.map(item => item.value));

  return {
    data,
    maxValue,
  };
};

// 生成健康指数数据
export const generateHealthIndexData = (features: any[]): LayerData => {
  if (!features || features.length === 0) {
    return { data: [], maxValue: 0 };
  }

  const data = features.map((feature) => {
    // 生成50到100之间的随机健康指数
    const value = getRandomInt(50, 100);
    const name = feature.properties.name || feature.id || '未知区域';
    return {
      label: name,
      value,
      // 根据健康指数设定不同的颜色
      color: value > 85 ? '#009688' : value > 70 ? '#26a69a' : '#4db6ac',
    };
  });

  // 查找最大值
  const maxValue = Math.max(...data.map(item => item.value));

  return {
    data,
    maxValue,
  };
};

// 生成土地使用类型数据
export const generateLandUseData = (features: any[]): LayerData => {
  if (!features || features.length === 0) {
    return { data: [], maxValue: 0 };
  }

  // 土地使用类型及其比例
  const landUseTypes = [
    { type: '建设用地', color: '#e57373' },
    { type: '农业用地', color: '#81c784' },
    { type: '林地', color: '#1b5e20' },
    { type: '草地', color: '#aed581' },
    { type: '水域', color: '#4fc3f7' },
    { type: '未利用地', color: '#cfd8dc' }
  ];

  const data = features.map((feature) => {
    // 为每个区域随机选择一个主要土地类型
    const mainTypeIndex = getRandomInt(0, landUseTypes.length - 1);
    // 为该类型分配50-80%的比例
    const mainValue = getRandomInt(50, 80);
    
    // 剩余比例分配给其他类型
    let remainingPercentage = 100 - mainValue;
    
    // 区域名称
    const name = feature.properties.name || feature.id || '未知区域';
    
    // 创建一个土地使用类型数组
    let landUseData = landUseTypes.map((type, index) => {
      if (index === mainTypeIndex) {
        return {
          label: `${name} - ${type.type}`,
          value: mainValue,
          color: type.color
        };
      } else if (remainingPercentage > 0) {
        // 为其他类型分配剩余百分比
        const value = index === landUseTypes.length - 1 
          ? remainingPercentage 
          : getRandomInt(1, Math.floor(remainingPercentage / (landUseTypes.length - index)));
        remainingPercentage -= value;
        return {
          label: `${name} - ${type.type}`,
          value: value,
          color: type.color
        };
      } else {
        return {
          label: `${name} - ${type.type}`,
          value: 0,
          color: type.color
        };
      }
    });
    
    // 过滤掉值为0的项
    landUseData = landUseData.filter(item => item.value > 0);
    
    return landUseData;
  });

  // 扁平化数组
  const flatData = data.flat();
  
  // 查找最大值
  const maxValue = Math.max(...flatData.map(item => item.value));

  return {
    data: flatData,
    maxValue,
  };
}; 