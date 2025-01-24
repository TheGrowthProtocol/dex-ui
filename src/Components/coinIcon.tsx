const CoinIcon = ({ icon }: { icon: string }) => {
  return (
    <div className="coin-icon-placeholder">
      <img src={icon} alt="Coin Icon" className="coin-icon" />
    </div>
  );
};

export default CoinIcon;