import React, { Component, PropTypes } from 'react'
import { Row, Col, Input, Button } from 'bootstrap'
import { Field, reduxForm } from 'redux-form'
import FormInputRow from 'client/components/FormInputRow'

const validate = values => {
  const errors = {}

  if (!values.Name) {
    errors.Name = 'Required'
  } else if (values.Name.length < 2) {
    errors.Name = 'Must be more than 2 characters'
  }

  if (!values.CanRespond) {
    errors.CanRespond = 'Required'
  } else if ((values.CanRespond.toLowerCase() !== "yes" &&
              values.CanRespond.toLowerCase() !== "no")) {
    errors.CanRespond = 'Must be "yes" or "no"'
  }

  if (!values.Eta) {
    errors.Eta = 'Required'
  }

  if (!values.Phone) {
    errors.Phone = 'Required'
  }
  // else if (isNaN(Number(values.Phone))) {
  //   errors.Phone = 'Must be a number with no dashes'
  // }
  else if (values.Phone.length < 7) {
    errors.Phone = 'Must be at least 7 digits'
  }

  return errors
}

const ResponseForm = (props) => {

  const {
    colProps,
    handleSubmit,
    resetForm,
    submitting,
    saveButtonText
  } = props

  return (
    <form onSubmit={handleSubmit}>

      <Field name="Name" type="text" component={FormInputRow} label="Responder Name"/>
      <Field name="Phone" type="text" component={FormInputRow} label="Phone Number"/>
      <Field name="CanRespond" type="text" component={FormInputRow} label="Can you respond?"/>
      <Field name="Eta" type="text" component={FormInputRow} label="ETA"/>

      <Row>
        <Col {...colProps} className="text-center">
          <Button type="submit"
            className="button-action button-blue">{saveButtonText}<span className="fa fa-arrow-right pull-right"/>
          </Button>
        </Col>
      </Row>
    </form>
  )

}

ResponseForm.defaultProps = {
  saveButtonText: 'Submit'
}

ResponseForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired
}

export default reduxForm({
  form: 'response',
  validate
})(ResponseForm)
