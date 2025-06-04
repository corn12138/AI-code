// 简化版的toast组件，用于暂时解决导入问题

export const toast = {
  success: (message: string) => {
    if (typeof window !== "undefined") {
      console.log("Success:", message);
      alert("成功: " + message);
    }
  },
  error: (message: string) => {
    if (typeof window !== "undefined") {
      console.error("Error:", message);
      alert("错误: " + message);
    }
  }
};
