export const formatAddress = (addr: string | undefined) => {
    if (!addr || addr.length < 10) {
      throw new Error("Invalid wallet address");
    }
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };