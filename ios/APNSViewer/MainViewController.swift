// MainViewController.swift
//
// Copyright (c) 2016 Auth0 (http://auth0.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import UIKit
import UserNotifications

class MainViewController: UIViewController {

    @IBOutlet weak var statusLabel: UILabel!

    override func viewDidLoad() {
        super.viewDidLoad()
        self.updateNotificationSettings()
        APNS.shared.onRegister = { [weak self] (token, error) in
            self?.updateNotificationSettings()
            guard let token = token else {
                print("Access to notifications not granted with error \(error)")
                return
            }
            let string = token.map { String(format: "%02x", $0) }.joined()
            print("Granted access to notifications and token \(string)")
        }
    }

    @IBAction func registerPressed(_ sender: AnyObject) {
        APNS.shared.register()
    }

    private func updateNotificationSettings() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            let text = settings.authorizationStatus.description
            print("Status: \(text)")
            self.statusLabel.text = text
        }
    }
}

class APNS {
    static let shared = APNS()

    var token: Data? {
        didSet {
            if token != nil {
                self.onRegister(token, nil)
            }
        }
    }

    var onRegister: (Data?, Error?) -> () = { _ in }

    func register() {
        UNUserNotificationCenter
            .current()
            .requestAuthorization(options: [.alert, .sound, .badge]) { (granted, error) in
                guard error == nil && granted else { return self.onRegister(nil, error) }
                UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

extension UNAuthorizationStatus: CustomStringConvertible {
    public var description: String {
        switch self {
        case .authorized:
            return "Authorized"
        case .denied:
            return "Denied"
        case .notDetermined:
            return "Not Determined"
        }
    }
}
