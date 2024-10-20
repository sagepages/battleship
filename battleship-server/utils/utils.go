package utils

import (
	"fmt"
	"os/exec"
)

func CreateUUID() ([]byte, error){
  uuid, err := exec.Command("uuidgen").Output()
	if err != nil {
    return nil, fmt.Errorf("%v", err)
	}
  return uuid, nil
}
