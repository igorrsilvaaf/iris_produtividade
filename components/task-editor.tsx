  <Input 
    type="time" 
    value={dueTime}
    onChange={(e) => setDueTime(e.target.value || "12:00")}
    className="w-full"
    inputMode="text"
    pattern="[0-9]{2}:[0-9]{2}"
    placeholder="HH:MM"
    onClick={(e) => {
      const target = e.target as HTMLInputElement;
      target.focus();
      if (typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          target.click();
        }, 100);
      }
    }}
  /> 