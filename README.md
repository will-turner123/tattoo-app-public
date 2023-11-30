
# Tattoo App

Note: This project, initially undertaken as a freelance gig, unfortunately did not reach completion. However, despite its incomplete state, the project exhibits numerous features

This is an application that uses a Django backend with a React Native expo frontend.

You can see some of the functionality of the app below

View users near your location and view their profile. Search other locations + dark mode!

![demo 1](demo/1.gif)

Post functionality
![demo 2](demo/2.gif)

## Prerequisites

Ensure you have the following installed on your system:

- Python 3.x
- Django 3.x
- Node.js (LTS version)
- Expo CLI
- Ngrok
- Virtualenv (optional, but recommended)

## Setting Up Your Python Virtual Environment

A Python virtual environment is an isolated environment where you can install Python packages without affecting your system Python installation. It's recommended to use a virtual environment for your Django project to manage dependencies.

You can set it up using the following commands:

```bash
pip install virtualenv
virtualenv venv
```

To activate the virtual environment, run:

On Windows:

```bash
venv\Scripts\activate.bat
```

On Unix or MacOS:

```bash
source venv/bin/activate
```

## Setting Up Django Backend

Once your virtual environment is activated, navigate to the Django project directory and run the following command to install the necessary Python packages:

```bash
pip install -r requirements.txt
```

### Database Migration

Run migrations to apply the database changes. Note that `--run-syncdb` option will also create any necessary tables according to the database schema if they do not exist.

```bash
python manage.py migrate --run-syncdb
```

You can then start the Django development server on your local machine:

```bash
python manage.py runserver localhost:8000
```

To expose your local server to the internet, you can use Ngrok:

```bash
ngrok http 8000
```

Remember to update your Django settings to include the Ngrok URL in `ALLOWED_HOSTS`.

## Python Environment Variables

In the `/server` directory, you will find a file named `.env.example`. Make a copy of this file in the same directory, rename it to `.env`, and populate the variables.

It should contain the following variables:

- `SECRET_KEY`: This should be populated with a Django secret key. You can generate a Django secret key using online tools or scripts.
- `DEBUG`: This can be `True` or `False` depending on your environment. Typically, this is set to `True` in a development environment and `False` in a production environment.

Here is an example of how your `.env` file should look:

```env
SECRET_KEY=your_secret_key_here
DEBUG=True
## Setting Up React Native Expo Frontend

Make sure you have installed Node.js and Expo CLI on your machine. You can then install the necessary JavaScript dependencies by running:

```bash
npm install
```

or if you are using Yarn:

```bash
yarn install
```

You can then start the Expo server:

```bash
expo start
```

You can now view your project on your phone by scanning the QR code shown in your terminal using the Expo Go app, or in a web browser at the displayed localhost URL.

### Configuring Google Maps and Server URL

Update your `app.json` to include your Google Maps API Key and your Ngrok URL (this would be your SERVER_URL):

```json
"extra": {
  "MAP_API_KEY": "your google maps api key",
  "SERVER_URL": "https://2135433820e1.ngrok.app"
},
```
## Further Reading

- [Official Django documentation](https://docs.djangoproject.com/en/3.2/)
- [Official React Native documentation](https://reactnative.dev/docs/getting-started)
- [Official Expo documentation](https://docs.expo.dev/)
- [Official Ngrok documentation](https://ngrok.com/docs)

## Gotchas
- Update with any found gotchas