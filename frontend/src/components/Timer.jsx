import React, { useMemo } from 'react'
import CountDown from 'react-countdown'

const Timer = ({time, setisExpire}) => {
  const targetTime = useMemo(()=>Date.now() + time,[time])
  return (
    <div className='timer'>
      <CountDown onComplete= {()=>setisExpire(true)} date={targetTime} />
    </div>
  )
}

export default Timer;
