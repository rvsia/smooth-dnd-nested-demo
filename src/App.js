import React, { useReducer, createContext, useContext } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';

const DnDContext = createContext();

const ContainerWrap = ({groupName, children, id, Component}) => {
  const {state, setState} = useContext(DnDContext);

  const onDrop = (info) => setState({type: 'changeColumn', info, id });

  const onDragStart = (info) => setState({type: 'selectItem', info});

  const getChildPayload = (index) => state.items[id].items[index];

  return (
    <React.Fragment>
      {id}
      <Container
        groupName="1"
        onDrop={onDrop}
        onDragStart={onDragStart}
        getChildPayload={getChildPayload}
        style={{border: '1px solid #000000', minHeight: 500, padding: 20, background: 'aliceblue'}}
      >
        {state.items[id].items.map((item, index) => {
          return(
            <Component item={item}/>
          )
        })}
      </Container>
    </React.Fragment>
  );
};

const Item = ({item}) => {
  const { state } = useContext(DnDContext);

  const {label, items} = state.items[item];

  return (<Draggable key={item}>
    {!items && <div className="item">{label || item}</div>}
    {items && <ContainerWrap id={item} Component={Item} />}
  </Draggable>);
};


const initialState = {
  selectedItem: null,
  items: {
    item1: { label: 'some-label'},
    item2: { label: 'container', items: []},
    item3: {},
    item4: {},
    'components-list': {items:['item1', 'item2', 'item3']},
    'form': {items:['item4']}
  }
}

const isNumber = num => typeof num === 'number';

const reducer = (state, { type, info, id }) => {
  if(type === 'changeColumn') {
    const newContainer = state.items[id].items;

    if(info.addedIndex !== info.removedIndex) {
      if(isNumber(info.addedIndex) && isNumber(info.removedIndex)) {
        newContainer.splice(info.removedIndex, 1);
        newContainer.splice(info.addedIndex, 0, info.payload);
      } else if (isNumber(info.addedIndex)) {
        newContainer.splice(info.addedIndex, 0, info.payload)
      } else if (isNumber(info.removedIndex)) {
        newContainer.splice(info.removedIndex, 1)
      }
    }

    return {
      ...state,
      selectedItem: info.removedIndex ? state.selectedItem : null,
      items: {
        ...state.items,
        [id]: {
          ...state.items[id],
          items: newContainer
        }
      }
    }
  }

  if(type === 'selectItem') {
    return {
      ...state,
      selectedItem: info.payload
    }
  }

  return state;
}

const App = () => {
    const [state, setState] = useReducer(reducer, initialState);

    return (
      <div className="main-container">
        <DnDContext.Provider value={{state, setState}}>
          <ContainerWrap id="components-list" Component={Item}/>
          <ContainerWrap id="form" Component={Item}/>
        </DnDContext.Provider>
        <pre>
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
    )
};

export default App;
