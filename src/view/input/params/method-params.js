import React from 'react'
import FatCatRigidParams from './params-fatcat-rigid'
import FatCatFlexParams from './params-fatcat-flex'
import CeParams from './params-ce'
import CeCpParams from './params-ce-cp'
import SmithWatermanParams from './params-smith-wat'

export default function MethodParams({ ctx }) {
  const method = ctx.getMethodName()
  function chooseView(value) {
    switch (value) {
      case 'fatcat-rigid':
        return <FatCatRigidParams ctx={ctx} />
      case 'fatcat-flexible':
        return <FatCatFlexParams ctx={ctx} />
      case 'ce':
        return <CeParams ctx={ctx} />
      case 'ce-cp':
        return <CeCpParams ctx={ctx} />
      case 'smith-waterman-3d':
        return <SmithWatermanParams ctx={ctx} />
    }
  }
  return chooseView(method)
}
