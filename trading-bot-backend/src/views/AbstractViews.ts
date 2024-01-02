import { Response } from 'express'

export abstract class AbstractView {
  abstract routes: { [key: string]: string } // Define routes in child classes

  renderData(res: Response, data: any) {
    res.status(200).json(data)
  }

  renderError(res: Response, errorMessage: string) {
    res.status(500).json({ error: errorMessage })
  }

  renderMessage(res: Response, message: string) {
    res.status(200).json({ message: message })
  }
}
