import React, { useState } from 'react'
import classNames from 'classnames'

import '../../../suggestions/suggestions.css'
import Autosuggest from 'react-autosuggest'

import { suggestEntries } from '../../../../utils/suggester'

export default function EntryID({ value, onValueChange }) {
  const [suggestions, setSuggestions] = useState([])

  function onChange(event, { newValue }) {
    if (!newValue) newValue = '';
    const v = newValue.trim().toUpperCase();
    if (value !== v) onValueChange(v);
  }

  function loadSuggestions(value) {
    suggestEntries(value).then((suggested) => setSuggestions(suggested))
  }

  function onSuggestionsFetchRequested({ value }) {
    if ( value && value.length > 0 && value.length < 4 ) loadSuggestions(value);
    else setSuggestions([]);
  }

  const inputProps = {
    placeholder: 'PDB ID',
    value: value ? value : '',
    className: classNames('inp', 'inp-txt', 'inp-transf'),
    onChange: onChange
  }

  const getSuggestionValue = (suggestion) => suggestion
  const renderSuggestion = (suggestion) => <div>{suggestion}</div>
  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={() => setSuggestions([])}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
    />
  )
}
