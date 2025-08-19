export const formatCurrency = (val) => {
  if (val === null || val === undefined) return "";

  if (typeof val === "number") {
    return new Intl.NumberFormat("vi-VN").format(val);
  }

  const number = parseInt(val.replace(/\D/g, ""), 10);
  if (isNaN(number)) return "";
  return new Intl.NumberFormat("vi-VN").format(number);
};
