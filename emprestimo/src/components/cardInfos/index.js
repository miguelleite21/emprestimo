import "./style.css";

function CardInfos({ info, value }) {
  return (
    <div className="divCardInfo">
      <h6>{info}</h6>
      <h4>{value}</h4>
    </div>
  );
}

export default CardInfos;
