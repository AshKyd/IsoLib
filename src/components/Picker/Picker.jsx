import { useEffect, useState } from "preact/hooks";
import iconSrc from "./Image-x-generic.svg";
import "./Picker.css";

function PickerFolder({ item, root, ...props }) {
  if (item.type === "folder") {
    return (
      <li className="picker-folder">
        <h2>{item.name}</h2>
        <ul>
          {item.children.map((child) => (
            <li>
              <PickerFolder
                root={`${root}/${item.name}`}
                item={child}
                {...props}
              />
            </li>
          ))}
        </ul>
      </li>
    );
  }

  if (item.type === "file") {
    const itemUrl = `${root}/${item.name}`;
    return (
      <a
        class={
          itemUrl === props.value
            ? "picker-item picker-item--selected"
            : "picker-item"
        }
        onClick={(e) => {
          props.onChange(itemUrl);
          e.preventDefault();
        }}
        href={itemUrl}
      >
        <img src={iconSrc} alt="" />
        {item.name}
      </a>
    );
  }
}

export default function FilePicker({ value, onChange, onError }) {
  const [items, setItems] = useState({});

  useEffect(() => {
    fetch("https://isobits.kyd.au/index.json")
      .then((res) => res.json())
      .then(setItems)
      .catch(onError);
  }, []);

  if (!items) return null;

  return (
    <ul class="picker">
      <PickerFolder
        root="https://isobits.kyd.au"
        value={value}
        onChange={onChange}
        item={items}
      />
    </ul>
  );
}
