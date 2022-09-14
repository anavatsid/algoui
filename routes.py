from process_ui import MainReceiver


def add_routes_to_resource(_api):
    _api.add_resource(MainReceiver, '/get_request', strict_slashes=False)
