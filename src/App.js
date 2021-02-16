import React, { useState, useRef } from "react";
import "./style.css";

document.head.innerHTML += "<link rel='apple-touch-icon' href='https://raw.githubusercontent.com/menzen/vgdd/master/src/icon.png'>";
document.head.innerHTML += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">';
document.head.innerHTML += '<link href="https://fonts.googleapis.com/css?family=Source+Code+Pro:400,700|Lato:400,700,900" rel="stylesheet">';

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, "DEL", 0, "OK"];

const readItems = () => {
  const items = localStorage.getItem("vgdd");
  return items ? JSON.parse(items) : [];
};

const saveItems = items => localStorage.setItem("vgdd", JSON.stringify(items));

const className = classes => classes.filter(c => !!c).join(" ");

const animate = el => {
  el.classList.add("animate");
  setTimeout(() => el.classList.remove("animate"), 50);
};

const hasScrollbar = element => element.scrollHeight !== element.offsetHeight;

const initialState = {
  number: "",
  value: "",
  submitted: false,
  items: readItems(),
  focus: false,
  active: []
};

const onClickNumber = ({ e, state, setState }) => {
  const cur = e.target.innerHTML.trim();
  const { number, value, items, active } = state;

  animate(e.target);

  if (cur === "DEL") {
    if (number.length) setState({ ...state, number: number.slice(0, -1) });
    else {
      const update = items.filter(item => !active.includes(item.id));

      setState({
        ...state,
        items: update
      });

      saveItems(update);
    }
  } else if (cur === "OK") {
    if (value.length && number.length) setState({ ...state, submitted: true });
    else setState({ ...state, focus: true });
  } else setState({ ...state, number: number + "" + cur });
};

const handleAppCenter = () =>
  setTimeout(
    () =>
      hasScrollbar(document.body)
        ? document.body.classList.remove("center")
        : document.body.classList.add("center"),
    500
  );

const Number = ({ cur, state, setState }) => (
  <div
    className={className([
      "number",
      cur === "OK" && "ok",
      cur === "DEL" && "del"
    ])}
    onClick={e => onClickNumber({ e, state, setState })}
  >
    {cur}
  </div>
);

const Break = () => <div className="break" />;

const Numbers = ({ setState, state }) => (
  <div className="numbers">
    {numbers.map((cur, idx) => (
      <React.Fragment key={idx}>
        {idx % 3 === 0 && <Break />}
        <Number cur={cur} setState={setState} state={state} />
      </React.Fragment>
    ))}
  </div>
);

const Form = ({ state, setState }) => {
  const ref = useRef(null);
  const { value, focus, number } = state;

  const onSubmit = e => {
    e.preventDefault();
    if (value.length && number.length) setState({ ...state, submitted: true });
  };

  const onChange = e => {
    setState({
      ...state,
      value: e.target.value
    });
  };

  if (focus) {
    ref.current.focus();
  }

  return (
    <div className="form">
      <input
        className="output"
        type="text"
        defaultValue={number}
        readOnly="readonly"
      />
      <form onSubmit={onSubmit}>
        <input
          className="input"
          type="text"
          value={value}
          ref={ref}
          onChange={onChange}
        />
        <input type="submit" value="OK" />
      </form>
    </div>
  );
};

const Item = ({ item, idx, onClick, active }) => (
  <li
    className={className([idx % 2 !== 0 && "odd", active && "active"])}
    onClick={e => onClick(e, item.id)}
  >
    <div className="value">{item.value}</div>
    <div className="key">{item.key}</div>
  </li>
);

const Items = ({ state, setState }) => {
  const { items, active } = state;
  const onClick = (e, id) => {
    active.includes(id)
      ? setState({ ...state, active: active.filter(i => i !== id) })
      : setState({ ...state, active: [...active, id] });
  };

  return (
    <ul>
      {items
        .sort((a, b) => a.value.localeCompare(b.value))
        .map((item, idx) => (
          <Item
            key={idx}
            item={item}
            idx={idx}
            onClick={onClick}
            active={active.includes(item.id)}
          />
        ))}
    </ul>
  );
};

const About = () => (
  <a className="about" href="https://github.com/menzen/vgdd">
    @menzen
  </a>
);

export default function App() {
  const [state, setState] = useState(initialState);
  const { number, submitted, items, value } = state;

  if (submitted) {
    const update = [{ key: number, value, id: number + value}, ...items];

    setState({
      ...state,
      number: "",
      value: "",
      submitted: false,
      focus: false,
      items: update
    });

    saveItems(update);
    location.hash = "#vgdd";
    location.hash = "";
  }

  handleAppCenter();

  return (
    <div id="vgdd">
      <Form state={state} setState={setState} />
      <Numbers state={state} setState={setState} />
      {items.length > 0 && <Items state={state} setState={setState} />}
      <About />
    </div>
  );
}
