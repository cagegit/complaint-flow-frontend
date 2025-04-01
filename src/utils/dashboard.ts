export const grid = {
  left: '4%',
  right: '5%',
  top: 50,
  bottom: 40,
};

export const tooltip = {
  trigger: 'axis',
  axisPointer: {
    type: 'shadow',
  },
  backgroundColor: 'rgba(50,50,50,0.7)',
  borderColor: '#ccc',
  borderWidth: 1,
  textStyle: {
    color: '#fff',
  },
  formatter: function (params) {
    const date = params[0].axisValue;
    let result = `${date}<br/>`;

    params.forEach((param) => {
      let color = '';
      if (param.seriesName === '满意率') {
        color = PERCENT_COLOR.hex;
      } else {
        color = CASE_COLOR.hex;
      }
      result += `<span style="color: ${color}">●</span> ${param.seriesName}: ${param.value}<br/>`;
    });

    return result;
  },
};

export const getCoordinates = (startArc, endArc) => {
  const posi = [
    Math.sin(startArc),
    -Math.cos(startArc), // Fixed: negative sign added
    Math.sin(endArc),
    -Math.cos(endArc), // Fixed: negative sign added
  ];
  const dx = posi[2] - posi[0];
  const dy = posi[3] - posi[1];
  return getLocation(dx, dy);
};

const getLocation = (dx, dy) => {
  const tanV = dx / dy;
  const directsign = Math.abs(tanV) < 1;
  const t = directsign ? tanV : 1 / tanV;
  const sign1 = t > 0 ? 1 : -1;
  const sign2 = dx > 0 ? 1 : -1;
  const sign = directsign ? sign1 * sign2 : sign2;

  // Fixed: corrected numerical constants
  const group1 = [0.5 - (sign * t) / 2, 0.5 + (sign * t) / 2];
  const group2 = sign > 0 ? [0, 1] : [1, 0];

  const group = [...group1, ...group2];
  const keys = directsign ? ['x', 'x2', 'y', 'y2'] : ['y', 'y2', 'x', 'x2'];

  const res = {};
  keys.forEach((k, idx) => {
    res[k] = group[idx];
  });
  return res;
};

/**
 * 动态计算 Y 轴配置，确保刻度为 10 的倍数
 * @param {number[]} data 动态数据数组（如 [25, 43, 67]）
 * @returns { { max: number, interval: number } } 返回最大刻度值和间隔
 */
export function calculateDynamicYAxis(data, number = 5) {
  if (data.length === 0) return { max: 100, interval: 20 }; // 默认值

  // 计算数据最大值并向上取整到最近的 10 的倍数
  const dataMax = Math.max(...data) + 50;
  let max = Math.ceil(dataMax / 10) * 10;
  if (max === 0) max = 10; // 处理全 0 数据

  // 动态计算合理间隔（优先接近 5 段分割，且为 10 的倍数）
  let interval = Math.round(max / number / 10) * 10;
  interval = Math.max(10, interval); // 最小间隔为 10

  // 重新校准 max，确保是 interval 的整数倍
  max = Math.ceil(max / interval) * interval;

  return { max, interval };
}

export const PERCENT_COLOR = {
  hex: '#ff8547',
  rgb: 'rgb(255, 137, 59)',
  rgbStr: '255, 133, 71',
};

export const CASE_COLOR = {
  hex: '#60f0bb',
  rgb: 'rgb(96, 240, 187)',
  rgbStr: '96, 240, 187',
};
