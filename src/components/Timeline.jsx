import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

export default function Timeline({
  duration,
  onUpdate,
}) {
  return (
    <Nouislider
      behaviour="tap-drag"
      step={1}
      range={{ min: 0, max: duration || 1 }}
      start={[0, duration || 1]}
      connect
      onUpdate={onUpdate}
    />
  );
}

