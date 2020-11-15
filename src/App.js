import React, { useState, useRef, useEffect } from "react";
import "./style.css";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, "DEL", 0, "OK"];

const readItems = () => {
  const items = localStorage.getItem("vgdd");
  return items ? JSON.parse(items) : [];
};

const saveItems = items => localStorage.setItem("vgdd", JSON.stringify(items));

const className = classes => classes.filter(c => !!c).join(" ");

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

  if (cur === "DEL") {
    if (number.length) setState({ ...state, number: number.slice(0, -1) });
    else {
      const update = items.filter(item => !active.includes(item.key));

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
      <>
        {idx % 3 === 0 && <Break />}
        <Number key={idx} cur={cur} setState={setState} state={state} />
      </>
    ))}
  </div>
);

const NumberOut = ({ number }) => <div className="number-out">{number}</div>;

const Input = ({ state, setState }) => {
  const ref = useRef(null);
  const { value, focus } = state;

  const onSubmit = e => {
    e.preventDefault();
    setState({ ...state, visible: false, submitted: true });
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
    <form onSubmit={onSubmit}>
      <label>
        <input type="text" value={value} ref={ref} onChange={onChange} />
      </label>
      <input type="submit" value="OK" />
    </form>
  );
};

const Item = ({ item, idx, onClick, active }) => (
  <li
    className={className([idx % 2 === 0 && "odd", active && "active"])}
    onClick={e => onClick(e, item.key)}
  >
    <div className="value">{item.value}</div>
    <div className="key">{item.key}</div>
  </li>
);

const Items = ({ state, setState }) => {
  const { items, active } = state;
  const onClick = (e, key) => {
    active.includes(key)
      ? setState({ ...state, active: active.filter(i => i !== key) })
      : setState({ ...state, active: [...active, key] });
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
            active={active.includes(item.key)}
          />
        ))}
    </ul>
  );
};

export default function App() {
  const [state, setState] = useState(initialState);
  const { number, visible, submitted, items, value } = state;

  if (submitted) {
    const update = [{ key: number, value }, ...items];

    setState({
      ...state,
      number: "",
      value: "",
      submitted: false,
      items: update
    });

    saveItems(update);
  }

  return (
    <>
      <NumberOut number={number} />
      {visible === visible && <Input state={state} setState={setState} />}
      <Numbers state={state} setState={setState} />
      {items.length > 0 && <Items state={state} setState={setState} />}
    </>
  );
}
