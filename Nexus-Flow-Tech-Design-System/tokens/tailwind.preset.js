module.exports = {
  theme: {
    extend: {
      colors: {
        nft: {
          navy: "#052D72",
          blue: "#0757C9",
          electricBlue: "#24C9FF",
          violet: "#7726D5",
          magenta: "#E22987",
          orange: "#F4510B",
          amber: "#FF9A0B",
          gold: "#ECAF24",
          surface: "#F6F8FC",
          border: "#D9DDE3",
          graphite: "#10131B"
        }
      },
      boxShadow: {
        "nft-sm": "0 4px 18px rgba(5,45,114,0.08)",
        "nft-md": "0 12px 30px rgba(5,45,114,0.12)",
        "nft-glow-blue": "0 0 32px rgba(36,201,255,0.30)",
        "nft-glow-orange": "0 0 32px rgba(244,81,11,0.30)"
      },
      backgroundImage: {
        "nft-flow": "linear-gradient(90deg, #24C9FF 0%, #0757C9 18%, #7726D5 45%, #E22987 58%, #F4510B 79%, #FF9A0B 100%)"
      },
      borderRadius: {
        "nft-sm": "8px",
        "nft-md": "12px",
        "nft-lg": "20px",
      }
    }
  }
}
